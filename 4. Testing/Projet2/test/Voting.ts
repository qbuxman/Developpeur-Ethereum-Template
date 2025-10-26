import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Voting", function () {
    let contract: any;
    let owner: any;
    let firstVoter: any;
    let secondVoter: any;

    before(async () => {
        contract = await ethers.deployContract("Voting");
        [owner, firstVoter, secondVoter] = await ethers.getSigners();
    })

    describe("Initial state", () => {
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
        it("Should return a voter with getVoter", async () => {
            await contract.addVoter(firstVoter.address)

            expect(await contract.connect(firstVoter).getVoter(firstVoter.address)).to.deep.eq([true, false, 0n]);
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

    describe.only('Workflow', () => {
        it.only("Should change workflow status only by the owner", async () => {
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
});