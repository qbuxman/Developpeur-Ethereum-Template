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

    mapping (address => bool) authorizedVoter;
    Proposal[] private proposals;

    constructor() Ownable(msg.sender) {}

    function getVoteStatus() external view returns(WorkflowStatus) {
        return status;
    }

    function setWithlist(address _newVoterAdress) onlyOwner external {
        require(status == WorkflowStatus.RegisteringVoters, "This functionnality is not available");
        authorizedVoter[_newVoterAdress] = true;
        emit VoterRegistered(_newVoterAdress);
    }

    function changeWorkflowStatus(WorkflowStatus _newStatus) onlyOwner external {
        require(_newStatus <= WorkflowStatus.VotesTallied, "This status does not exist");
        require(uint8(_newStatus) == uint8(status) + 1, "The voting status cannot be changed until the previous status has been completed");
        
        WorkflowStatus _currentVoteStatus = status;
        status = _newStatus;
        
        emit WorkflowStatusChange(_currentVoteStatus, _newStatus);
    }

    function setProposal(string memory _description) external {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Setting proposal is not available");
        require(authorizedVoter[msg.sender], "You're not authorized to send proposal");
        require(bytes(_description).length > 0, "Description cannot be empty");

        proposals.push(
            Proposal({
                description: _description,
                voteCount: 0
            })
        );

        emit ProposalRegistered(proposals.length);
    }

    function getProposals() external view returns(Proposal[] memory) {
        return proposals;
    }

    function getWinner() external view returns (address) {
        
    }

}