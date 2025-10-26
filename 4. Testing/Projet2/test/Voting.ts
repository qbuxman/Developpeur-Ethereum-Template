import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Voting", function () {
    let contract: any;
    let owner: any;
    let firstVoter: any;
    let secondVoter: any;
    let thirdVoter: any;

    describe("Initial state", () => {
        before(async () => {
            contract = await ethers.deployContract("Voting");
            [owner, firstVoter, secondVoter, thirdVoter] = await ethers.getSigners();
        });

        it("should winningProposalID == 0", async () => {
            expect(await contract.winningProposalID()).to.eq(0n)
        })

        it("should proposalsArray is empty", async () => {
            await expect(contract.getOneProposal(0)).revert(ethers);
        })

        it("should have workflowStatus == RegisteringVoters", async () => {
            expect(await contract.workflowStatus()).to.eq(0n);
        });

        it("should have owner set correctly", async () => {
            expect(await contract.owner()).to.eq(owner.address);
        });

        it("should set a voter with correct defaults values", async () => {
            await contract.addVoter(firstVoter.address);
       
            const voterData = await contract.connect(firstVoter).getVoter(secondVoter.address);
            
            expect(voterData.isRegistered).to.be.false;
            expect(voterData.hasVoted).to.be.false; 
            expect(voterData.votedProposalId).to.eq(0n);
        });
    })

    describe("Getters", () => {
        before(async () => {
            contract = await ethers.deployContract("Voting");
            [owner, firstVoter, secondVoter, thirdVoter] = await ethers.getSigners();
        });
        
        it("Should revert if getVoter called by non voter", async () => {
            await expect(contract.connect(secondVoter).getVoter(firstVoter.address)).revert(ethers);
        });

        it("Should return a voter with getVoter", async () => {
            await contract.addVoter(firstVoter.address);
            expect(await contract.connect(firstVoter).getVoter(firstVoter.address)).to.deep.eq([true, false, 0n]);
        });

        it("Should revert if getOneProposal called by non voter", async () => {
            await expect(contract.connect(secondVoter).getVoter(secondVoter.address)).revert(ethers);
        });

        it("Should return a default proposal with getOneProposal", async () => {
            await contract.startProposalsRegistering()

            expect(await contract.connect(firstVoter).getOneProposal(0)).to.deep.eq(['GENESIS', 0n]);
        });

        it("Should return the new proposal with getOneProposal after submit it", async () => {
            const newProposal = 'new proposal'
            await contract.connect(firstVoter).addProposal(newProposal)

            expect(await contract.connect(firstVoter).getOneProposal(1)).to.deep.eq([newProposal, 0n]);
        });
    })

    describe('Workflow', () => {
        before(async () => {
             contract = await ethers.deployContract("Voting");
            [owner, firstVoter, secondVoter, thirdVoter] = await ethers.getSigners();
        });

        it("Should change workflow status only by the owner", async () => {
            await expect(contract.connect(firstVoter).startProposalsRegistering()).revert(ethers);
            await contract.startProposalsRegistering();
            expect(await contract.workflowStatus()).to.eq(1n);

            await expect(contract.connect(firstVoter).endProposalsRegistering()).revert(ethers);
            await contract.endProposalsRegistering();
            expect(await contract.workflowStatus()).to.eq(2n);


            await expect(contract.connect(firstVoter).startVotingSession()).revert(ethers);
            await contract.startVotingSession();
            expect(await contract.workflowStatus()).to.eq(3n);

            await expect(contract.connect(firstVoter).endVotingSession()).revert(ethers);
            await contract.endVotingSession();
            expect(await contract.workflowStatus()).to.eq(4n);

            await expect(contract.connect(firstVoter).tallyVotes()).revert(ethers);
            await contract.tallyVotes();
            expect(await contract.workflowStatus()).to.eq(5n);
        });
    })

    describe('Vote', () => {
        before(async () => {
            contract = await ethers.deployContract("Voting");
            [owner, firstVoter, secondVoter, thirdVoter] = await ethers.getSigners();
            await contract.addVoter(firstVoter.address);
            await contract.addVoter(secondVoter.address);
            await contract.startProposalsRegistering();
            await contract.connect(firstVoter).addProposal('Buy XRP lol');
            await contract.connect(secondVoter).addProposal('Buy Bitcoin');
            await contract.endProposalsRegistering();
            await contract.startVotingSession();
            expect(await contract.workflowStatus()).to.eq(3n);
        });

        it("Should revert if a non voter send vote", async () => {
            await expect(contract.connect(thirdVoter).setVote(0n)).revert(ethers);
        });

        it("Should set correctly a vote", async () => {
            await contract.connect(firstVoter).setVote(1n);
            await contract.connect(secondVoter).setVote(1n);

            expect(await contract.connect(firstVoter).getVoter(firstVoter.address)).to.deep.eq([true, true, 1n]);
            expect(await contract.connect(firstVoter).getVoter(secondVoter.address)).to.deep.eq([true, true, 1n]);
            expect(await contract.connect(firstVoter).getOneProposal(1n)).to.deep.eq(['Buy XRP lol', 2n]);
        });

        it("Should correctly revert if taillyVote has not be called by owner", async () => {
            await contract.endVotingSession();
            expect(await contract.workflowStatus()).to.eq(4n);
            await expect(contract.connect(firstVoter).tallyVotes()).revert(ethers);
        });

        it("Should correctly tailled votes", async () => {
            await contract.tallyVotes();

            expect(await contract.winningProposalID()).to.eq(1n);
        });
    });

    describe('Emits', () => {
        before(async () => {
            contract = await ethers.deployContract("Voting");
            [owner, firstVoter, secondVoter, thirdVoter] = await ethers.getSigners();
            expect(await contract.workflowStatus()).to.eq(0n);
        });

        it('Should emit event VoterRegistered when adding voter', async () => {
            await expect(contract.addVoter(firstVoter.address))
                .to.emit(contract, "VoterRegistered")
                .withArgs(firstVoter.address);
        });


        it('Should emit event ProposalRegistered when adding proposal', async () => {
            await expect(contract.startProposalsRegistering()).to.emit(contract, "WorkflowStatusChange").withArgs(0n, 1n);
            await expect(contract.connect(firstVoter).addProposal('Mocha proposal'))
                .to.emit(contract, "ProposalRegistered")
                .withArgs(1n);
            await expect(contract.endProposalsRegistering()).to.emit(contract, "WorkflowStatusChange").withArgs(1n, 2n);
        });

        it('Should emit event Voted when sending a vote', async () => {
            await expect(contract.startVotingSession()).to.emit(contract, "WorkflowStatusChange").withArgs(2n, 3n);
            await expect(contract.connect(firstVoter).setVote(1n))
                .to.emit(contract, "Voted")
                .withArgs(firstVoter.address, 1n);
            await expect(contract.endVotingSession()).to.emit(contract, "WorkflowStatusChange").withArgs(3n, 4n);
        });
    });

    describe("Full Voting workflow", () => {
        before(async () => {
            contract = await ethers.deployContract("Voting");
            [owner, firstVoter, secondVoter, thirdVoter] = await ethers.getSigners();
        });

        it("Should complete entire voting process and determine winning proposal", async () => {

            // 1. Register voters
            expect(await contract.workflowStatus()).to.eq(0n);
            await contract.addVoter(firstVoter.address);
            await contract.addVoter(secondVoter.address);
            await contract.addVoter(thirdVoter.address);

            // 2. Start proposals registration
            await contract.startProposalsRegistering();
            expect(await contract.workflowStatus()).to.eq(1n);

            // 3. Add proposals
            await contract.connect(firstVoter).addProposal('Build a park');
            await contract.connect(secondVoter).addProposal('Build a library');
            await contract.connect(thirdVoter).addProposal('Build a school');

            // 4. End proposals registration
            await contract.endProposalsRegistering();
            expect(await contract.workflowStatus()).to.eq(2n);

            // 5. Start voting session
            await contract.startVotingSession();
            expect(await contract.workflowStatus()).to.eq(3n);

            // 6. Vote
            await contract.connect(firstVoter).setVote(3n);
            await contract.connect(secondVoter).setVote(3n);
            await contract.connect(thirdVoter).setVote(2n);

            // 7. End voting session
            await contract.endVotingSession();
            expect(await contract.workflowStatus()).to.eq(4n);

            // 8. Tally votes
            await expect(contract.tallyVotes())
                .to.emit(contract, "WorkflowStatusChange")
                .withArgs(4n, 5n);

            // 9. Verify results
            expect(await contract.workflowStatus()).to.eq(5n);
            expect(await contract.winningProposalID()).to.eq(3n);

            const winningProposal = await contract.connect(firstVoter).getOneProposal(3n);
            expect(winningProposal.description).to.eq('Build a school');
            expect(winningProposal.voteCount).to.eq(2n);
        });
});
});