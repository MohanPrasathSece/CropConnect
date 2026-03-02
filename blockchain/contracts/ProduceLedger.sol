// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Minimal Counters implementation since OpenZeppelin v5 removed it
library CountersWrapper {
    struct Counter {
        uint256 _value;
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}

/**
 * @title ProduceLedger
 * @dev Smart contract for managing agricultural produce records on blockchain
 * @notice This contract maintains immutable records of crop production and supply chain
 */
contract ProduceLedger is AccessControl, ReentrancyGuard {
    using CountersWrapper for CountersWrapper.Counter;

    // Role definitions
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant AGGREGATOR_ROLE = keccak256("AGGREGATOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Counter for produce IDs
    CountersWrapper.Counter private _produceIdCounter;

    // Enums for produce status and quality
    enum ProduceStatus { Harvested, InTransit, Delivered, Sold }
    enum QualityGrade { A, B, C, D }

    // Struct to store produce information
    struct Produce {
        uint256 id;
        address farmer;
        string cropType;
        uint256 quantity; // in kg
        QualityGrade grade;
        uint256 harvestDate;
        uint256 expectedPrice; // in wei per kg
        ProduceStatus status;
        string location; // GPS coordinates or area name
        string imageHash; // IPFS hash of crop image
        bool isOrganic;
        string[] certifications;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Struct for transport information
    struct Transport {
        uint256 produceId;
        address aggregator;
        string transportDetails;
        uint256 pickupDate;
        uint256 deliveryDate;
        string route;
        uint256 temperature; // for cold chain tracking
        bool isDelivered;
    }

    // Mappings
    mapping(uint256 => Produce) public produces;
    mapping(uint256 => Transport) public transports;
    mapping(address => uint256[]) public farmerProduces;
    mapping(string => uint256[]) public cropTypeProduces;

    // Events
    event ProduceRegistered(
        uint256 indexed produceId,
        address indexed farmer,
        string cropType,
        uint256 quantity,
        QualityGrade grade
    );

    event ProduceStatusUpdated(
        uint256 indexed produceId,
        ProduceStatus oldStatus,
        ProduceStatus newStatus,
        address updatedBy
    );

    event TransportAssigned(
        uint256 indexed produceId,
        address indexed aggregator,
        string transportDetails
    );

    event QualityGradeUpdated(
        uint256 indexed produceId,
        QualityGrade oldGrade,
        QualityGrade newGrade,
        address updatedBy
    );

    /**
     * @dev Constructor sets up roles and initial admin
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register new produce on the blockchain
     */
    function registerProduce(
        string memory _cropType,
        uint256 _quantity,
        QualityGrade _grade,
        uint256 _expectedPrice,
        string memory _location,
        string memory _imageHash,
        bool _isOrganic,
        string[] memory _certifications
    ) external onlyRole(FARMER_ROLE) nonReentrant returns (uint256) {
        require(bytes(_cropType).length > 0, "Crop type cannot be empty");
        require(_quantity > 0, "Quantity must be greater than 0");

        _produceIdCounter.increment();
        uint256 newProduceId = _produceIdCounter.current();

        produces[newProduceId] = Produce({
            id: newProduceId,
            farmer: msg.sender,
            cropType: _cropType,
            quantity: _quantity,
            grade: _grade,
            harvestDate: block.timestamp,
            expectedPrice: _expectedPrice,
            status: ProduceStatus.Harvested,
            location: _location,
            imageHash: _imageHash,
            isOrganic: _isOrganic,
            certifications: _certifications,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        // Update mappings
        farmerProduces[msg.sender].push(newProduceId);
        cropTypeProduces[_cropType].push(newProduceId);

        emit ProduceRegistered(newProduceId, msg.sender, _cropType, _quantity, _grade);

        return newProduceId;
    }

    /**
     * @dev Update produce status (only by authorized roles)
     */
    function updateProduceStatus(
        uint256 _produceId,
        ProduceStatus _newStatus
    ) external {
        uint256 currentCount = _produceIdCounter.current();
        require(_produceId <= currentCount && _produceId > 0, "Invalid produce ID");
        
        Produce storage produce = produces[_produceId];
        require(
            msg.sender == produce.farmer || 
            hasRole(AGGREGATOR_ROLE, msg.sender) || 
            hasRole(RETAILER_ROLE, msg.sender) ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized to update status"
        );

        ProduceStatus oldStatus = produce.status;
        produce.status = _newStatus;
        produce.updatedAt = block.timestamp;

        emit ProduceStatusUpdated(_produceId, oldStatus, _newStatus, msg.sender);
    }

    /**
     * @dev Update quality grade (only by Aggregators or Admins)
     */
    function updateQualityGrade(
        uint256 _produceId,
        QualityGrade _newGrade
    ) external {
        uint256 currentCount = _produceIdCounter.current();
        require(_produceId <= currentCount && _produceId > 0, "Invalid produce ID");
        require(
            hasRole(AGGREGATOR_ROLE, msg.sender) || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Only aggregators or admins can update grade"
        );

        Produce storage produce = produces[_produceId];
        QualityGrade oldGrade = produce.grade;
        produce.grade = _newGrade;
        produce.updatedAt = block.timestamp;

        emit QualityGradeUpdated(_produceId, oldGrade, _newGrade, msg.sender);
    }

    /**
     * @dev Get produce details by ID
     */
    function getProduce(uint256 _produceId) external view returns (Produce memory) {
        return produces[_produceId];
    }
    
    /**
     * @dev Get current produce counter
     */
    function getCurrentProduceId() external view returns (uint256) {
        return _produceIdCounter.current();
    }

    /**
     * @dev Role management
     */
    function grantFarmerRole(address _account) external onlyRole(ADMIN_ROLE) {
        _grantRole(FARMER_ROLE, _account);
    }

    function grantAggregatorRole(address _account) external onlyRole(ADMIN_ROLE) {
        _grantRole(AGGREGATOR_ROLE, _account);
    }

    function grantRetailerRole(address _account) external onlyRole(ADMIN_ROLE) {
        _grantRole(RETAILER_ROLE, _account);
    }
}
