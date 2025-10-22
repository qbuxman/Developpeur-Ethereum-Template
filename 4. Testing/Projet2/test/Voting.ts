import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("Voting", function () {
    let contract: any;
    let owner: any;
    let firstVoter: any;
    let secondVoter: any;

    beforeEach(async () => {
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
});