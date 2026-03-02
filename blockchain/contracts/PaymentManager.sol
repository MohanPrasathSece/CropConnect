// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PaymentManager is AccessControl, ReentrancyGuard {
    address public produceLedgerAddress;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Escrow {
        uint256 amount;
        address buyer;
        bool isReleased;
    }

    mapping(uint256 => Escrow) public escrows;

    event PaymentProcessed(uint256 indexed produceId, address indexed buyer, uint256 amount);
    event FundsReleased(uint256 indexed produceId, address indexed receiver, uint256 amount);
    
    constructor(address _produceLedgerAddress) {
        produceLedgerAddress = _produceLedgerAddress;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function processPayment(uint256 _produceId) external payable nonReentrant {
        require(msg.value > 0, "Payment must be greater than 0");
        require(escrows[_produceId].amount == 0, "Payment already exists for this produce");

        escrows[_produceId] = Escrow({
            amount: msg.value,
            buyer: msg.sender,
            isReleased: false
        });

        emit PaymentProcessed(_produceId, msg.sender, msg.value);
    }

    function releaseFunds(uint256 _produceId, address payable _receiver) external onlyRole(ADMIN_ROLE) nonReentrant {
        Escrow storage escrow = escrows[_produceId];
        require(escrow.amount > 0, "No escrow found");
        require(!escrow.isReleased, "Funds already released");

        escrow.isReleased = true;
        uint256 amount = escrow.amount;
        _receiver.transfer(amount);

        emit FundsReleased(_produceId, _receiver, amount);
    }
    
    function withdraw() external onlyRole(ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
