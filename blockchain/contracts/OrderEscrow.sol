// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OrderEscrow
 * @dev Manages escrow payments for agricultural orders with dispute resolution
 */
contract OrderEscrow is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    enum EscrowStatus {
        Created,        // 0: Escrow created
        Funded,         // 1: Buyer funded the escrow
        InProgress,     // 2: Order in progress
        Completed,      // 3: Order completed, ready for release
        Released,       // 4: Funds released to seller
        Refunded,       // 5: Funds refunded to buyer
        Disputed,       // 6: Dispute raised
        Resolved        // 7: Dispute resolved
    }

    struct Escrow {
        string orderId;
        uint256 produceId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 platformFee;
        EscrowStatus status;
        uint256 createdAt;
        uint256 fundedAt;
        uint256 completedAt;
        uint256 releasedAt;
        bool isPartialRelease;
        uint256 partialAmount;
        string disputeReason;
        address disputeWinner;
    }

    struct Milestone {
        string description;
        uint256 percentage;
        bool isCompleted;
        uint256 completedAt;
    }

    mapping(string => Escrow) public escrows;
    mapping(string => Milestone[]) public orderMilestones;
    mapping(address => uint256) public pendingWithdrawals;
    
    uint256 public platformFeePercentage = 2; // 2% platform fee
    address public platformWallet;
    uint256 public totalEscrowedAmount;
    uint256 public totalReleasedAmount;

    event EscrowCreated(
        string indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 timestamp
    );

    event EscrowFunded(
        string indexed orderId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    event MilestoneCompleted(
        string indexed orderId,
        uint256 milestoneIndex,
        uint256 amount,
        uint256 timestamp
    );

    event FundsReleased(
        string indexed orderId,
        address indexed seller,
        uint256 amount,
        uint256 platformFee,
        uint256 timestamp
    );

    event FundsRefunded(
        string indexed orderId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    event DisputeRaised(
        string indexed orderId,
        address indexed raisedBy,
        string reason,
        uint256 timestamp
    );

    event DisputeResolved(
        string indexed orderId,
        address indexed winner,
        uint256 timestamp
    );

    constructor(address _platformWallet) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ARBITER_ROLE, msg.sender);
    }

    /**
     * @dev Create new escrow for an order
     */
    function createEscrow(
        string memory _orderId,
        uint256 _produceId,
        address _seller,
        uint256 _amount
    ) external payable nonReentrant returns (bool) {
        require(escrows[_orderId].buyer == address(0), "Escrow already exists");
        require(_seller != address(0), "Invalid seller address");
        require(_amount > 0, "Amount must be greater than 0");
        require(msg.value >= _amount, "Insufficient payment");

        uint256 platformFee = (_amount * platformFeePercentage) / 100;

        escrows[_orderId] = Escrow({
            orderId: _orderId,
            produceId: _produceId,
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            platformFee: platformFee,
            status: EscrowStatus.Funded,
            createdAt: block.timestamp,
            fundedAt: block.timestamp,
            completedAt: 0,
            releasedAt: 0,
            isPartialRelease: false,
            partialAmount: 0,
            disputeReason: "",
            disputeWinner: address(0)
        });

        totalEscrowedAmount += _amount;

        emit EscrowCreated(_orderId, msg.sender, _seller, _amount, block.timestamp);
        emit EscrowFunded(_orderId, msg.sender, _amount, block.timestamp);

        // Refund excess payment
        if (msg.value > _amount) {
            payable(msg.sender).transfer(msg.value - _amount);
        }

        return true;
    }

    /**
     * @dev Add milestones to an order
     */
    function addMilestones(
        string memory _orderId,
        string[] memory _descriptions,
        uint256[] memory _percentages
    ) external returns (bool) {
        require(_descriptions.length == _percentages.length, "Array length mismatch");
        Escrow storage escrow = escrows[_orderId];
        require(escrow.buyer == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Unauthorized");
        require(escrow.status == EscrowStatus.Funded, "Invalid escrow status");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _descriptions.length; i++) {
            totalPercentage += _percentages[i];
            orderMilestones[_orderId].push(Milestone({
                description: _descriptions[i],
                percentage: _percentages[i],
                isCompleted: false,
                completedAt: 0
            }));
        }

        require(totalPercentage == 100, "Percentages must sum to 100");

        escrow.status = EscrowStatus.InProgress;
        escrow.isPartialRelease = true;

        return true;
    }

    /**
     * @dev Complete a milestone
     */
    function completeMilestone(
        string memory _orderId,
        uint256 _milestoneIndex
    ) external nonReentrant returns (bool) {
        Escrow storage escrow = escrows[_orderId];
        require(escrow.seller == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Unauthorized");
        require(escrow.status == EscrowStatus.InProgress, "Invalid escrow status");
        require(_milestoneIndex < orderMilestones[_orderId].length, "Invalid milestone index");

        Milestone storage milestone = orderMilestones[_orderId][_milestoneIndex];
        require(!milestone.isCompleted, "Milestone already completed");

        milestone.isCompleted = true;
        milestone.completedAt = block.timestamp;

        uint256 releaseAmount = (escrow.amount * milestone.percentage) / 100;
        uint256 fee = (releaseAmount * platformFeePercentage) / 100;
        uint256 sellerAmount = releaseAmount - fee;

        escrow.partialAmount += releaseAmount;
        pendingWithdrawals[escrow.seller] += sellerAmount;
        pendingWithdrawals[platformWallet] += fee;

        emit MilestoneCompleted(_orderId, _milestoneIndex, releaseAmount, block.timestamp);

        // Check if all milestones completed
        bool allCompleted = true;
        for (uint256 i = 0; i < orderMilestones[_orderId].length; i++) {
            if (!orderMilestones[_orderId][i].isCompleted) {
                allCompleted = false;
                break;
            }
        }

        if (allCompleted) {
            escrow.status = EscrowStatus.Completed;
            escrow.completedAt = block.timestamp;
        }

        return true;
    }

    /**
     * @dev Release full escrow to seller
     */
    function releaseEscrow(string memory _orderId) external nonReentrant returns (bool) {
        Escrow storage escrow = escrows[_orderId];
        require(
            escrow.buyer == msg.sender || 
            hasRole(ADMIN_ROLE, msg.sender) || 
            hasRole(ARBITER_ROLE, msg.sender),
            "Unauthorized"
        );
        require(
            escrow.status == EscrowStatus.Funded || 
            escrow.status == EscrowStatus.InProgress || 
            escrow.status == EscrowStatus.Completed,
            "Cannot release escrow"
        );

        uint256 releaseAmount = escrow.amount - escrow.partialAmount;
        uint256 fee = (releaseAmount * platformFeePercentage) / 100;
        uint256 sellerAmount = releaseAmount - fee;

        escrow.status = EscrowStatus.Released;
        escrow.releasedAt = block.timestamp;

        totalReleasedAmount += escrow.amount;
        totalEscrowedAmount -= escrow.amount;

        pendingWithdrawals[escrow.seller] += sellerAmount;
        pendingWithdrawals[platformWallet] += fee;

        emit FundsReleased(_orderId, escrow.seller, sellerAmount, fee, block.timestamp);

        return true;
    }

    /**
     * @dev Refund escrow to buyer
     */
    function refundEscrow(string memory _orderId) external nonReentrant returns (bool) {
        Escrow storage escrow = escrows[_orderId];
        require(
            escrow.seller == msg.sender || 
            hasRole(ADMIN_ROLE, msg.sender) || 
            hasRole(ARBITER_ROLE, msg.sender),
            "Unauthorized"
        );
        require(
            escrow.status == EscrowStatus.Funded || 
            escrow.status == EscrowStatus.InProgress,
            "Cannot refund escrow"
        );

        uint256 refundAmount = escrow.amount - escrow.partialAmount;

        escrow.status = EscrowStatus.Refunded;
        totalEscrowedAmount -= escrow.amount;

        pendingWithdrawals[escrow.buyer] += refundAmount;

        emit FundsRefunded(_orderId, escrow.buyer, refundAmount, block.timestamp);

        return true;
    }

    /**
     * @dev Raise a dispute
     */
    function raiseDispute(
        string memory _orderId,
        string memory _reason
    ) external returns (bool) {
        Escrow storage escrow = escrows[_orderId];
        require(
            escrow.buyer == msg.sender || escrow.seller == msg.sender,
            "Only buyer or seller can raise dispute"
        );
        require(
            escrow.status == EscrowStatus.InProgress || 
            escrow.status == EscrowStatus.Completed,
            "Invalid status for dispute"
        );

        escrow.status = EscrowStatus.Disputed;
        escrow.disputeReason = _reason;

        emit DisputeRaised(_orderId, msg.sender, _reason, block.timestamp);

        return true;
    }

    /**
     * @dev Resolve dispute (only arbiter)
     */
    function resolveDispute(
        string memory _orderId,
        address _winner,
        uint256 _buyerPercentage,
        uint256 _sellerPercentage
    ) external onlyRole(ARBITER_ROLE) nonReentrant returns (bool) {
        require(_buyerPercentage + _sellerPercentage == 100, "Percentages must sum to 100");
        
        Escrow storage escrow = escrows[_orderId];
        require(escrow.status == EscrowStatus.Disputed, "No active dispute");

        uint256 remainingAmount = escrow.amount - escrow.partialAmount;
        uint256 buyerAmount = (remainingAmount * _buyerPercentage) / 100;
        uint256 sellerAmount = (remainingAmount * _sellerPercentage) / 100;

        escrow.status = EscrowStatus.Resolved;
        escrow.disputeWinner = _winner;
        totalEscrowedAmount -= escrow.amount;

        if (buyerAmount > 0) {
            pendingWithdrawals[escrow.buyer] += buyerAmount;
        }
        if (sellerAmount > 0) {
            uint256 fee = (sellerAmount * platformFeePercentage) / 100;
            pendingWithdrawals[escrow.seller] += (sellerAmount - fee);
            pendingWithdrawals[platformWallet] += fee;
        }

        emit DisputeResolved(_orderId, _winner, block.timestamp);

        return true;
    }

    /**
     * @dev Withdraw pending funds
     */
    function withdraw() external nonReentrant returns (bool) {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        return true;
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(string memory _orderId) external view returns (Escrow memory) {
        return escrows[_orderId];
    }

    /**
     * @dev Get order milestones
     */
    function getMilestones(string memory _orderId) external view returns (Milestone[] memory) {
        return orderMilestones[_orderId];
    }

    /**
     * @dev Update platform fee percentage
     */
    function setPlatformFee(uint256 _newFee) external onlyRole(ADMIN_ROLE) {
        require(_newFee <= 10, "Fee cannot exceed 10%");
        platformFeePercentage = _newFee;
    }

    /**
     * @dev Update platform wallet
     */
    function setPlatformWallet(address _newWallet) external onlyRole(ADMIN_ROLE) {
        require(_newWallet != address(0), "Invalid wallet address");
        platformWallet = _newWallet;
    }

    /**
     * @dev Grant arbiter role
     */
    function grantArbiterRole(address _account) external onlyRole(ADMIN_ROLE) {
        _grantRole(ARBITER_ROLE, _account);
    }

    /**
     * @dev Emergency withdraw (only admin)
     */
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        payable(platformWallet).transfer(address(this).balance);
    }

    receive() external payable {}
}
