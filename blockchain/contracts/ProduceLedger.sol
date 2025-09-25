// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ProduceLedger
 * @dev Smart contract for managing agricultural produce records on blockchain
 * @notice This contract maintains immutable records of crop production and supply chain
 */
contract ProduceLedger is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant AGGREGATOR_ROLE = keccak256("AGGREGATOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Counter for produce IDs
    Counters.Counter private _produceIdCounter;

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
     * @param _cropType Type of crop (e.g., "Paddy", "Maize")
     * @param _quantity Quantity in kg
     * @param _grade Quality grade of the produce
     * @param _expectedPrice Expected price per kg in wei
     * @param _location Location of harvest
     * @param _imageHash IPFS hash of crop image
     * @param _isOrganic Whether the produce is organic
     * @param _certifications Array of certification strings
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
        require(_expectedPrice > 0, "Expected price must be greater than 0");

        _produceIdCounter.increment();
        uint256 newProduceId = _produceIdCounter.current();

        Produce storage newProduce = produces[newProduceId];
        newProduce.id = newProduceId;
        newProduce.farmer = msg.sender;
        newProduce.cropType = _cropType;
        newProduce.quantity = _quantity;
        newProduce.grade = _grade;
        newProduce.harvestDate = block.timestamp;
        newProduce.expectedPrice = _expectedPrice;
        newProduce.status = ProduceStatus.Harvested;
        newProduce.location = _location;
        newProduce.imageHash = _imageHash;
        newProduce.isOrganic = _isOrganic;
        newProduce.certifications = _certifications;
        newProduce.createdAt = block.timestamp;
        newProduce.updatedAt = block.timestamp;

        // Update mappings
        farmerProduces[msg.sender].push(newProduceId);
        cropTypeProduces[_cropType].push(newProduceId);

        emit ProduceRegistered(newProduceId, msg.sender, _cropType, _quantity, _grade);

        return newProduceId;
    }

    /**
     * @dev Update produce status (only by authorized roles)
     * @param _produceId ID of the produce
     * @param _newStatus New status to set
     */
    function updateProduceStatus(
        uint256 _produceId,
        ProduceStatus _newStatus
    ) external {
        require(_produceId <= _produceIdCounter.current(), "Invalid produce ID");
        
        Produce storage produce = produces[_produceId];
        require(
            msg.sender == produce.farmer || 
            hasRole(AGGREGATOR_ROLE, msg.sender) || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized to update status"
        );

        ProduceStatus oldStatus = produce.status;
        produce.status = _newStatus;
        produce.updatedAt = block.timestamp;

        emit ProduceStatusUpdated(_produceId, oldStatus, _newStatus, msg.sender);
    }

    /**
     * @dev Assign transport to produce (only aggregators)
     * @param _produceId ID of the produce
     * @param _transportDetails Details about transport
     * @param _route Transport route
     * @param _temperature Temperature for cold chain
     */
    function assignTransport(
        uint256 _produceId,
        string memory _transportDetails,
        string memory _route,
        uint256 _temperature
    ) external onlyRole(AGGREGATOR_ROLE) nonReentrant {
        require(_produceId <= _produceIdCounter.current(), "Invalid produce ID");
        require(produces[_produceId].status == ProduceStatus.Harvested, "Produce not available for transport");

        Transport storage transport = transports[_produceId];
        transport.produceId = _produceId;
        transport.aggregator = msg.sender;
        transport.transportDetails = _transportDetails;
        transport.pickupDate = block.timestamp;
        transport.route = _route;
        transport.temperature = _temperature;
        transport.isDelivered = false;

        // Update produce status
        produces[_produceId].status = ProduceStatus.InTransit;
        produces[_produceId].updatedAt = block.timestamp;

        emit TransportAssigned(_produceId, msg.sender, _transportDetails);
    }

    /**
     * @dev Mark transport as delivered
     * @param _produceId ID of the produce
     */
    function markDelivered(uint256 _produceId) external onlyRole(AGGREGATOR_ROLE) {
        require(_produceId <= _produceIdCounter.current(), "Invalid produce ID");
        require(transports[_produceId].aggregator == msg.sender, "Not authorized for this transport");
        require(!transports[_produceId].isDelivered, "Already marked as delivered");

        transports[_produceId].isDelivered = true;
        transports[_produceId].deliveryDate = block.timestamp;
        
        produces[_produceId].status = ProduceStatus.Delivered;
        produces[_produceId].updatedAt = block.timestamp;
    }

    /**
     * @dev Update quality grade (only by authorized roles)
     * @param _produceId ID of the produce
     * @param _newGrade New quality grade
     */
    function updateQualityGrade(
        uint256 _produceId,
        QualityGrade _newGrade
    ) external {
        require(_produceId <= _produceIdCounter.current(), "Invalid produce ID");
        require(
            hasRole(AGGREGATOR_ROLE, msg.sender) || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized to update grade"
        );

        QualityGrade oldGrade = produces[_produceId].grade;
        produces[_produceId].grade = _newGrade;
        produces[_produceId].updatedAt = block.timestamp;

        emit QualityGradeUpdated(_produceId, oldGrade, _newGrade, msg.sender);
    }

    /**
     * @dev Get produce details by ID
     * @param _produceId ID of the produce
     * @return Produce struct
     */
    function getProduce(uint256 _produceId) external view returns (Produce memory) {
        require(_produceId <= _produceIdCounter.current(), "Invalid produce ID");
        return produces[_produceId];
    }

    /**
     * @dev Get transport details by produce ID
     * @param _produceId ID of the produce
     * @return Transport struct
     */
    function getTransport(uint256 _produceId) external view returns (Transport memory) {
        return transports[_produceId];
    }

    /**
     * @dev Get all produce IDs for a farmer
     * @param _farmer Address of the farmer
     * @return Array of produce IDs
     */
    function getFarmerProduces(address _farmer) external view returns (uint256[] memory) {
        return farmerProduces[_farmer];
    }

    /**
     * @dev Get all produce IDs for a crop type
     * @param _cropType Type of crop
     * @return Array of produce IDs
     */
    function getCropTypeProduces(string memory _cropType) external view returns (uint256[] memory) {
        return cropTypeProduces[_cropType];
    }

    /**
     * @dev Get current produce counter
     * @return Current counter value
     */
    function getCurrentProduceId() external view returns (uint256) {
        return _produceIdCounter.current();
    }

    /**
     * @dev Grant farmer role to an address (only admin)
     * @param _farmer Address to grant farmer role
     */
    function grantFarmerRole(address _farmer) external onlyRole(ADMIN_ROLE) {
        _grantRole(FARMER_ROLE, _farmer);
    }

    /**
     * @dev Grant aggregator role to an address (only admin)
     * @param _aggregator Address to grant aggregator role
     */
    function grantAggregatorRole(address _aggregator) external onlyRole(ADMIN_ROLE) {
        _grantRole(AGGREGATOR_ROLE, _aggregator);
    }

    /**
     * @dev Revoke farmer role from an address (only admin)
     * @param _farmer Address to revoke farmer role
     */
    function revokeFarmerRole(address _farmer) external onlyRole(ADMIN_ROLE) {
        _revokeRole(FARMER_ROLE, _farmer);
    }

    /**
     * @dev Revoke aggregator role from an address (only admin)
     * @param _aggregator Address to revoke aggregator role
     */
    function revokeAggregatorRole(address _aggregator) external onlyRole(ADMIN_ROLE) {
        _revokeRole(AGGREGATOR_ROLE, _aggregator);
    }
}
