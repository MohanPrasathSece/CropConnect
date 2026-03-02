// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SupplyChainTracker
 * @dev Tracks complete supply chain journey from farm to consumer
 */
contract SupplyChainTracker is AccessControl, ReentrancyGuard {
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant AGGREGATOR_ROLE = keccak256("AGGREGATOR_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum Stage { 
        Harvested,      // 0: Crop harvested by farmer
        Collected,      // 1: Collected by aggregator
        InStorage,      // 2: In aggregator storage
        InTransit,      // 3: Being transported
        AtRetailer,     // 4: Reached retailer
        Sold            // 5: Sold to consumer
    }

    struct Journey {
        uint256 produceId;
        Stage currentStage;
        address farmer;
        address aggregator;
        address transporter;
        address retailer;
        address consumer;
        uint256 harvestTimestamp;
        uint256 collectionTimestamp;
        uint256 storageTimestamp;
        uint256 transitTimestamp;
        uint256 retailerTimestamp;
        uint256 saleTimestamp;
        string[] locations;
        string[] temperatures;
        string[] notes;
        bool isActive;
    }

    struct Checkpoint {
        Stage stage;
        address actor;
        uint256 timestamp;
        string location;
        string temperature;
        string note;
    }

    mapping(uint256 => Journey) public journeys;
    mapping(uint256 => Checkpoint[]) public checkpoints;
    mapping(address => uint256[]) public actorJourneys;

    event JourneyStarted(
        uint256 indexed produceId,
        address indexed farmer,
        uint256 timestamp
    );

    event StageUpdated(
        uint256 indexed produceId,
        Stage indexed newStage,
        address indexed updatedBy,
        string location,
        uint256 timestamp
    );

    event CheckpointAdded(
        uint256 indexed produceId,
        Stage stage,
        address actor,
        string location,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Start a new supply chain journey
     */
    function startJourney(
        uint256 _produceId,
        string memory _location,
        string memory _temperature
    ) external onlyRole(FARMER_ROLE) returns (bool) {
        require(journeys[_produceId].farmer == address(0), "Journey already exists");

        journeys[_produceId] = Journey({
            produceId: _produceId,
            currentStage: Stage.Harvested,
            farmer: msg.sender,
            aggregator: address(0),
            transporter: address(0),
            retailer: address(0),
            consumer: address(0),
            harvestTimestamp: block.timestamp,
            collectionTimestamp: 0,
            storageTimestamp: 0,
            transitTimestamp: 0,
            retailerTimestamp: 0,
            saleTimestamp: 0,
            locations: new string[](0),
            temperatures: new string[](0),
            notes: new string[](0),
            isActive: true
        });

        journeys[_produceId].locations.push(_location);
        journeys[_produceId].temperatures.push(_temperature);

        _addCheckpoint(_produceId, Stage.Harvested, _location, _temperature, "Crop harvested");

        actorJourneys[msg.sender].push(_produceId);

        emit JourneyStarted(_produceId, msg.sender, block.timestamp);

        return true;
    }

    /**
     * @dev Update journey stage
     */
    function updateStage(
        uint256 _produceId,
        Stage _newStage,
        string memory _location,
        string memory _temperature,
        string memory _note
    ) external nonReentrant returns (bool) {
        Journey storage journey = journeys[_produceId];
        require(journey.isActive, "Journey not active");
        require(_newStage > journey.currentStage, "Cannot move to previous stage");

        // Verify permissions based on stage
        if (_newStage == Stage.Collected || _newStage == Stage.InStorage) {
            require(hasRole(AGGREGATOR_ROLE, msg.sender), "Only aggregator can update");
            if (journey.aggregator == address(0)) {
                journey.aggregator = msg.sender;
                actorJourneys[msg.sender].push(_produceId);
            }
            if (_newStage == Stage.Collected) {
                journey.collectionTimestamp = block.timestamp;
            } else {
                journey.storageTimestamp = block.timestamp;
            }
        } else if (_newStage == Stage.InTransit) {
            require(hasRole(TRANSPORTER_ROLE, msg.sender) || hasRole(AGGREGATOR_ROLE, msg.sender), 
                "Only transporter or aggregator can update");
            if (journey.transporter == address(0)) {
                journey.transporter = msg.sender;
                actorJourneys[msg.sender].push(_produceId);
            }
            journey.transitTimestamp = block.timestamp;
        } else if (_newStage == Stage.AtRetailer) {
            require(hasRole(RETAILER_ROLE, msg.sender), "Only retailer can update");
            if (journey.retailer == address(0)) {
                journey.retailer = msg.sender;
                actorJourneys[msg.sender].push(_produceId);
            }
            journey.retailerTimestamp = block.timestamp;
        } else if (_newStage == Stage.Sold) {
            require(hasRole(RETAILER_ROLE, msg.sender), "Only retailer can mark as sold");
            journey.saleTimestamp = block.timestamp;
            journey.isActive = false;
        }

        journey.currentStage = _newStage;
        journey.locations.push(_location);
        journey.temperatures.push(_temperature);
        journey.notes.push(_note);

        _addCheckpoint(_produceId, _newStage, _location, _temperature, _note);

        emit StageUpdated(_produceId, _newStage, msg.sender, _location, block.timestamp);

        return true;
    }

    /**
     * @dev Add checkpoint to journey
     */
    function _addCheckpoint(
        uint256 _produceId,
        Stage _stage,
        string memory _location,
        string memory _temperature,
        string memory _note
    ) internal {
        checkpoints[_produceId].push(Checkpoint({
            stage: _stage,
            actor: msg.sender,
            timestamp: block.timestamp,
            location: _location,
            temperature: _temperature,
            note: _note
        }));

        emit CheckpointAdded(_produceId, _stage, msg.sender, _location, block.timestamp);
    }

    /**
     * @dev Get complete journey details
     */
    function getJourney(uint256 _produceId) external view returns (Journey memory) {
        return journeys[_produceId];
    }

    /**
     * @dev Get all checkpoints for a produce
     */
    function getCheckpoints(uint256 _produceId) external view returns (Checkpoint[] memory) {
        return checkpoints[_produceId];
    }

    /**
     * @dev Get journeys for an actor
     */
    function getActorJourneys(address _actor) external view returns (uint256[] memory) {
        return actorJourneys[_actor];
    }

    /**
     * @dev Verify journey authenticity
     */
    function verifyJourney(uint256 _produceId) external view returns (bool, string memory) {
        Journey memory journey = journeys[_produceId];
        
        if (journey.farmer == address(0)) {
            return (false, "Journey does not exist");
        }

        if (!journey.isActive && journey.currentStage != Stage.Sold) {
            return (false, "Journey incomplete");
        }

        if (journey.currentStage == Stage.Sold) {
            return (true, "Journey complete and verified");
        }

        return (true, "Journey in progress and verified");
    }

    // Role management functions
    function grantFarmerRole(address _account) external onlyRole(ADMIN_ROLE) {
        _grantRole(FARMER_ROLE, _account);
    }

    function grantAggregatorRole(address _account) external onlyRole(ADMIN_ROLE) {
        _grantRole(AGGREGATOR_ROLE, _account);
    }

    function grantTransporterRole(address _account) external onlyRole(ADMIN_ROLE) {
        _grantRole(TRANSPORTER_ROLE, _account);
    }

    function grantRetailerRole(address _account) external onlyRole(ADMIN_ROLE) {
        _grantRole(RETAILER_ROLE, _account);
    }
}
