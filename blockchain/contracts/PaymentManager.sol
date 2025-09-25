// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ProduceLedger.sol";

/**
 * @title PaymentManager
 * @dev Smart contract for managing escrow payments in agricultural supply chain
 * @notice Handles automated payments with escrow functionality
 */
contract PaymentManager is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant AGGREGATOR_ROLE = keccak256("AGGREGATOR_ROLE");
    bytes32 public constant BUYER_ROLE = keccak256("BUYER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Counter for payment IDs
    Counters.Counter private _paymentIdCounter;

    // Reference to ProduceLedger contract
    ProduceLedger public produceLedger;

    // Payment status enum
    enum PaymentStatus { 
        Created, 
        PartialReleased, 
        FullyReleased, 
        Disputed, 
        Cancelled 
    }

    // Payment struct
    struct Payment {
        uint256 id;
        uint256 produceId;
        address farmer;
        address buyer;
        address aggregator;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 createdAt;
        uint256 deliveryDeadline;
        PaymentStatus status;
        bool isDisputed;
        string disputeReason;
    }

    // Dispute struct
    struct Dispute {
        uint256 paymentId;
        address initiator;
        string reason;
        uint256 createdAt;
        bool isResolved;
        address resolver;
        uint256 resolvedAt;
        string resolution;
    }

    // Mappings
    mapping(uint256 => Payment) public payments;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256[]) public farmerPayments;
    mapping(address => uint256[]) public buyerPayments;
    mapping(uint256 => uint256) public produceToPayment; // produceId => paymentId

    // Constants for payment splits
    uint256 public constant INITIAL_RELEASE_PERCENTAGE = 30; // 30% on handover
    uint256 public constant FINAL_RELEASE_PERCENTAGE = 70;   // 70% on delivery confirmation
    uint256 public constant DISPUTE_TIMEOUT = 7 days;       // Time to resolve disputes

    // Events
    event PaymentCreated(
        uint256 indexed paymentId,
        uint256 indexed produceId,
        address indexed farmer,
        address buyer,
        uint256 totalAmount
    );

    event PartialPaymentReleased(
        uint256 indexed paymentId,
        address indexed farmer,
        uint256 amount,
        string reason
    );

    event FullPaymentReleased(
        uint256 indexed paymentId,
        address indexed farmer,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed paymentId,
        address indexed initiator,
        string reason
    );

    event DisputeResolved(
        uint256 indexed paymentId,
        address indexed resolver,
        string resolution
    );

    event PaymentCancelled(
        uint256 indexed paymentId,
        address indexed canceller,
        string reason
    );

    /**
     * @dev Constructor sets up roles and ProduceLedger reference
     * @param _produceLedgerAddress Address of the ProduceLedger contract
     */
    constructor(address _produceLedgerAddress) {
        require(_produceLedgerAddress != address(0), "Invalid ProduceLedger address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        produceLedger = ProduceLedger(_produceLedgerAddress);
    }

    /**
     * @dev Create a new payment for produce
     * @param _produceId ID of the produce
     * @param _farmer Address of the farmer
     * @param _aggregator Address of the aggregator
     * @param _deliveryDeadline Deadline for delivery
     */
    function createPayment(
        uint256 _produceId,
        address _farmer,
        address _aggregator,
        uint256 _deliveryDeadline
    ) external payable onlyRole(BUYER_ROLE) nonReentrant returns (uint256) {
        require(msg.value > 0, "Payment amount must be greater than 0");
        require(_farmer != address(0), "Invalid farmer address");
        require(_deliveryDeadline > block.timestamp, "Delivery deadline must be in future");
        require(produceToPayment[_produceId] == 0, "Payment already exists for this produce");

        // Verify produce exists and is available
        ProduceLedger.Produce memory produce = produceLedger.getProduce(_produceId);
        require(produce.farmer == _farmer, "Farmer mismatch");
        require(
            produce.status == ProduceLedger.ProduceStatus.Harvested || 
            produce.status == ProduceLedger.ProduceStatus.InTransit,
            "Produce not available for purchase"
        );

        _paymentIdCounter.increment();
        uint256 newPaymentId = _paymentIdCounter.current();

        Payment storage newPayment = payments[newPaymentId];
        newPayment.id = newPaymentId;
        newPayment.produceId = _produceId;
        newPayment.farmer = _farmer;
        newPayment.buyer = msg.sender;
        newPayment.aggregator = _aggregator;
        newPayment.totalAmount = msg.value;
        newPayment.releasedAmount = 0;
        newPayment.createdAt = block.timestamp;
        newPayment.deliveryDeadline = _deliveryDeadline;
        newPayment.status = PaymentStatus.Created;
        newPayment.isDisputed = false;

        // Update mappings
        farmerPayments[_farmer].push(newPaymentId);
        buyerPayments[msg.sender].push(newPaymentId);
        produceToPayment[_produceId] = newPaymentId;

        emit PaymentCreated(newPaymentId, _produceId, _farmer, msg.sender, msg.value);

        return newPaymentId;
    }

    /**
     * @dev Release initial payment (30%) when produce is handed over
     * @param _paymentId ID of the payment
     */
    function releaseInitialPayment(uint256 _paymentId) external nonReentrant {
        require(_paymentId <= _paymentIdCounter.current(), "Invalid payment ID");
        
        Payment storage payment = payments[_paymentId];
        require(
            msg.sender == payment.aggregator || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized to release payment"
        );
        require(payment.status == PaymentStatus.Created, "Payment not in created status");
        require(!payment.isDisputed, "Payment is disputed");

        uint256 releaseAmount = (payment.totalAmount * INITIAL_RELEASE_PERCENTAGE) / 100;
        payment.releasedAmount += releaseAmount;
        payment.status = PaymentStatus.PartialReleased;

        // Transfer to farmer
        (bool success, ) = payable(payment.farmer).call{value: releaseAmount}("");
        require(success, "Transfer to farmer failed");

        emit PartialPaymentReleased(_paymentId, payment.farmer, releaseAmount, "Initial handover payment");
    }

    /**
     * @dev Release final payment (70%) when delivery is confirmed
     * @param _paymentId ID of the payment
     */
    function releaseFinalPayment(uint256 _paymentId) external nonReentrant {
        require(_paymentId <= _paymentIdCounter.current(), "Invalid payment ID");
        
        Payment storage payment = payments[_paymentId];
        require(
            msg.sender == payment.buyer || 
            msg.sender == payment.aggregator || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized to release payment"
        );
        require(payment.status == PaymentStatus.PartialReleased, "Initial payment not released");
        require(!payment.isDisputed, "Payment is disputed");

        // Verify delivery status from ProduceLedger
        ProduceLedger.Transport memory transport = produceLedger.getTransport(payment.produceId);
        require(transport.isDelivered, "Produce not yet delivered");

        uint256 remainingAmount = payment.totalAmount - payment.releasedAmount;
        payment.releasedAmount = payment.totalAmount;
        payment.status = PaymentStatus.FullyReleased;

        // Transfer remaining amount to farmer
        (bool success, ) = payable(payment.farmer).call{value: remainingAmount}("");
        require(success, "Transfer to farmer failed");

        emit FullPaymentReleased(_paymentId, payment.farmer, remainingAmount);
    }

    /**
     * @dev Raise a dispute for a payment
     * @param _paymentId ID of the payment
     * @param _reason Reason for the dispute
     */
    function raiseDispute(
        uint256 _paymentId,
        string memory _reason
    ) external {
        require(_paymentId <= _paymentIdCounter.current(), "Invalid payment ID");
        require(bytes(_reason).length > 0, "Dispute reason cannot be empty");
        
        Payment storage payment = payments[_paymentId];
        require(
            msg.sender == payment.farmer || 
            msg.sender == payment.buyer || 
            msg.sender == payment.aggregator,
            "Unauthorized to raise dispute"
        );
        require(!payment.isDisputed, "Dispute already exists");
        require(
            payment.status != PaymentStatus.FullyReleased && 
            payment.status != PaymentStatus.Cancelled,
            "Cannot dispute completed or cancelled payment"
        );

        payment.isDisputed = true;
        payment.disputeReason = _reason;

        Dispute storage dispute = disputes[_paymentId];
        dispute.paymentId = _paymentId;
        dispute.initiator = msg.sender;
        dispute.reason = _reason;
        dispute.createdAt = block.timestamp;
        dispute.isResolved = false;

        emit DisputeRaised(_paymentId, msg.sender, _reason);
    }

    /**
     * @dev Resolve a dispute (only admin)
     * @param _paymentId ID of the payment
     * @param _resolution Resolution details
     * @param _refundToBuyer Whether to refund to buyer (true) or release to farmer (false)
     */
    function resolveDispute(
        uint256 _paymentId,
        string memory _resolution,
        bool _refundToBuyer
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(_paymentId <= _paymentIdCounter.current(), "Invalid payment ID");
        require(bytes(_resolution).length > 0, "Resolution cannot be empty");
        
        Payment storage payment = payments[_paymentId];
        require(payment.isDisputed, "No dispute exists");
        require(!disputes[_paymentId].isResolved, "Dispute already resolved");

        Dispute storage dispute = disputes[_paymentId];
        dispute.isResolved = true;
        dispute.resolver = msg.sender;
        dispute.resolvedAt = block.timestamp;
        dispute.resolution = _resolution;

        payment.isDisputed = false;

        uint256 refundAmount = payment.totalAmount - payment.releasedAmount;
        
        if (_refundToBuyer && refundAmount > 0) {
            // Refund remaining amount to buyer
            payment.status = PaymentStatus.Cancelled;
            (bool success, ) = payable(payment.buyer).call{value: refundAmount}("");
            require(success, "Refund to buyer failed");
        } else if (refundAmount > 0) {
            // Release remaining amount to farmer
            payment.releasedAmount = payment.totalAmount;
            payment.status = PaymentStatus.FullyReleased;
            (bool success, ) = payable(payment.farmer).call{value: refundAmount}("");
            require(success, "Transfer to farmer failed");
        }

        emit DisputeResolved(_paymentId, msg.sender, _resolution);
    }

    /**
     * @dev Cancel payment (only before any release)
     * @param _paymentId ID of the payment
     * @param _reason Reason for cancellation
     */
    function cancelPayment(
        uint256 _paymentId,
        string memory _reason
    ) external nonReentrant {
        require(_paymentId <= _paymentIdCounter.current(), "Invalid payment ID");
        
        Payment storage payment = payments[_paymentId];
        require(
            msg.sender == payment.buyer || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized to cancel payment"
        );
        require(payment.status == PaymentStatus.Created, "Cannot cancel after partial release");
        require(!payment.isDisputed, "Cannot cancel disputed payment");

        payment.status = PaymentStatus.Cancelled;

        // Refund full amount to buyer
        (bool success, ) = payable(payment.buyer).call{value: payment.totalAmount}("");
        require(success, "Refund failed");

        emit PaymentCancelled(_paymentId, msg.sender, _reason);
    }

    /**
     * @dev Auto-release payment after deadline (emergency function)
     * @param _paymentId ID of the payment
     */
    function autoReleaseAfterDeadline(uint256 _paymentId) external nonReentrant {
        require(_paymentId <= _paymentIdCounter.current(), "Invalid payment ID");
        
        Payment storage payment = payments[_paymentId];
        require(block.timestamp > payment.deliveryDeadline + DISPUTE_TIMEOUT, "Deadline not passed");
        require(payment.status == PaymentStatus.PartialReleased, "Invalid status for auto-release");
        require(!payment.isDisputed, "Cannot auto-release disputed payment");

        uint256 remainingAmount = payment.totalAmount - payment.releasedAmount;
        payment.releasedAmount = payment.totalAmount;
        payment.status = PaymentStatus.FullyReleased;

        // Transfer remaining amount to farmer
        (bool success, ) = payable(payment.farmer).call{value: remainingAmount}("");
        require(success, "Auto-release transfer failed");

        emit FullPaymentReleased(_paymentId, payment.farmer, remainingAmount);
    }

    /**
     * @dev Get payment details
     * @param _paymentId ID of the payment
     * @return Payment struct
     */
    function getPayment(uint256 _paymentId) external view returns (Payment memory) {
        require(_paymentId <= _paymentIdCounter.current(), "Invalid payment ID");
        return payments[_paymentId];
    }

    /**
     * @dev Get dispute details
     * @param _paymentId ID of the payment
     * @return Dispute struct
     */
    function getDispute(uint256 _paymentId) external view returns (Dispute memory) {
        return disputes[_paymentId];
    }

    /**
     * @dev Get farmer's payment history
     * @param _farmer Address of the farmer
     * @return Array of payment IDs
     */
    function getFarmerPayments(address _farmer) external view returns (uint256[] memory) {
        return farmerPayments[_farmer];
    }

    /**
     * @dev Get buyer's payment history
     * @param _buyer Address of the buyer
     * @return Array of payment IDs
     */
    function getBuyerPayments(address _buyer) external view returns (uint256[] memory) {
        return buyerPayments[_buyer];
    }

    /**
     * @dev Get current payment counter
     * @return Current counter value
     */
    function getCurrentPaymentId() external view returns (uint256) {
        return _paymentIdCounter.current();
    }

    /**
     * @dev Grant buyer role to an address (only admin)
     * @param _buyer Address to grant buyer role
     */
    function grantBuyerRole(address _buyer) external onlyRole(ADMIN_ROLE) {
        _grantRole(BUYER_ROLE, _buyer);
    }

    /**
     * @dev Emergency withdrawal (only admin, for contract upgrades)
     */
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    /**
     * @dev Receive function to accept Ether
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}
