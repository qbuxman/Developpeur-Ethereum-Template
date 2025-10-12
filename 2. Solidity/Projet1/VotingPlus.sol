// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
    struct Proposal {
        string description;
        uint voteCount;
    }

   enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    WorkflowStatus public status;
    mapping (address => Voter) public authorizedVoters;
    Proposal[] private proposals;

    constructor() Ownable(msg.sender) {}

    modifier hasCorrectWorkflowStatus(WorkflowStatus _requiredStatus) {
        require(status == _requiredStatus, "This functionality is not available");
        _;
    }

    modifier hasProposalsAvailable() {
        require(proposals.length > 0, "No proposals available");
        _;
    }

    modifier senderIsRegistered() {
        require(authorizedVoters[msg.sender].isRegistered, "You're not authorized");
        _;
    }

    // Utilitary 
    function changeWorkflowStatus(WorkflowStatus _newStatus) onlyOwner external {
        require(_newStatus <= WorkflowStatus.VotesTallied, "This status does not exist");
        require(uint8(_newStatus) == uint8(status) + 1, "The voting status cannot be changed until the previous status has been completed");
        
        WorkflowStatus _currentVoteStatus = status;
        status = _newStatus;
        
        emit WorkflowStatusChange(_currentVoteStatus, _newStatus);
    }

    // (NEW) Step 1 - The owner set voters in a whitelist 
    // Description : Can add multiple address in one time (with a gas limit protection)
    function setWhitelistBatch(address[] calldata _voterAddresses) external hasCorrectWorkflowStatus(WorkflowStatus.RegisteringVoters) onlyOwner {
        require(_voterAddresses.length > 0, "Empty array");
        require(_voterAddresses.length <= 100, "Too many addresses at once"); // Gas limit protection
        
        for (uint i = 0; i < _voterAddresses.length; i++) {
            address voter = _voterAddresses[i];
            
            require(voter != address(0), "Invalid address in array");
            require(!authorizedVoters[voter].isRegistered, "Voter already registered");
            
            authorizedVoters[voter] = Voter(true, false, 0);
            
            emit VoterRegistered(voter);
        }
    }

    // Step 2 - The voters can submit proposal
    function setProposal(string memory _description) hasCorrectWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted) senderIsRegistered external {
        require(bytes(_description).length > 0, "Description cannot be empty");

        proposals.push(
            Proposal({
                description: _description,
                voteCount: 0
            })
        );

        emit ProposalRegistered(proposals.length - 1);
    }

    function getProposals() hasProposalsAvailable external view returns(Proposal[] memory) {
        return proposals;
    }

    // Step 3 - Only addresses in whitelist can vote
    function submitVote(uint _proposalId) hasCorrectWorkflowStatus(WorkflowStatus.VotingSessionStarted) senderIsRegistered external {
        require(!authorizedVoters[msg.sender].hasVoted, "You have already voted");
        require(_proposalId < proposals.length, "Invalid proposal ID");

        authorizedVoters[msg.sender].hasVoted = true;
        authorizedVoters[msg.sender].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;
        
        emit Voted(msg.sender, _proposalId);
    }

    function getVoteByVoter(address _voterAddress) external view returns (Voter memory) {
        require(authorizedVoters[_voterAddress].isRegistered, "Unknown voter");
        
        return authorizedVoters[_voterAddress];
    }

    // Step 4 - Get the winning proposal (max voteCount)
    // Note: In case of a tie, returns the first proposal with the highest vote count
    function getWinner() hasCorrectWorkflowStatus(WorkflowStatus.VotesTallied) hasProposalsAvailable external view returns (uint) {        
        uint maxVotes;
        uint winningProposalId;
        
        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                winningProposalId = i;
            }
        }

        return winningProposalId;
    }
}