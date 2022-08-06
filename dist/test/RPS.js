"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const hardhat_1 = require("hardhat");
const constants_1 = require("./constants");
var Choices;
(function (Choices) {
    Choices[Choices["ROCK"] = 0] = "ROCK";
    Choices[Choices["PAPER"] = 1] = "PAPER";
    Choices[Choices["SCISSORS"] = 2] = "SCISSORS";
})(Choices || (Choices = {}));
describe('Rock, Paper, Scissors', function () {
    async function deployRps() {
        const Rps = await hardhat_1.ethers.getContractFactory('Rps');
        const rps = await Rps.deploy();
        return { rps };
    }
    async function createGame() {
        const Rps = await hardhat_1.ethers.getContractFactory('Rps');
        const rps = await Rps.deploy();
        const [p1] = await hardhat_1.ethers.getSigners();
        const clearChoice = Choices.PAPER + '-' + 'test';
        const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
        const entryFee = hardhat_1.ethers.utils.parseEther('0.1'); /* 0.1 Eth */
        await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
        return { rps, p1, clearChoice, entryFee };
    }
    describe('makeGame', function () {
        it('Should create a game', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const clearChoice = '2-test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const weiAmount = ethers_1.BigNumber.from('100000000000000000'); /* 0.1 Eth */
            await rps.connect(p1).makeGame(hashedChoice, { value: weiAmount });
            const game = await rps.connect(p1).getGame(p1.address, 0);
            (0, chai_1.expect)(game.p1SaltedChoice).to.equal(hashedChoice);
            (0, chai_1.expect)(game.entryFee).to.equal(weiAmount);
            //expect(game.p2).to.equal();
        });
        it('Should revert on entryFee below minimum', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const clearChoice = Choices.PAPER + '-' + 'test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const weiAmount = ethers_1.BigNumber.from('900000000000000'); /* 0.09 Eth */
            await (0, chai_1.expect)(rps.connect(p1).makeGame(hashedChoice, { value: weiAmount })).to.be.revertedWith(constants_1.ERRORS.AmountTooLow);
        });
    });
    describe('joinGame', function () {
        it('Should let p2 join the game', async function () {
            const { rps, p1, entryFee } = await (0, hardhat_network_helpers_1.loadFixture)(createGame);
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const p2Choice = Choices.PAPER;
            const gameIndex = 0;
            await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
            const game = await rps.connect(p1).getGame(p1.address, gameIndex);
            (0, chai_1.expect)(game.p2).to.equal(p2.address);
            (0, chai_1.expect)(game.p2).to.equal(p2.address);
            (0, chai_1.expect)(game.p2Choice).to.equal(p2Choice);
        });
        it('Should revert on too few tokens sent by p2', async function () {
            const { rps, p1 } = await (0, hardhat_network_helpers_1.loadFixture)(createGame);
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const p2Choice = Choices.PAPER;
            const gameIndex = 0;
            await (0, chai_1.expect)(rps
                .connect(p2)
                .joinGame(p1.address, gameIndex, p2Choice, { value: ethers_1.BigNumber.from('100000000') })).to.be.revertedWith(constants_1.ERRORS.AmountTooLow);
        });
        it('Should revert on index out of bounds p2', async function () {
            const { rps, p1, entryFee } = await (0, hardhat_network_helpers_1.loadFixture)(createGame);
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const p2Choice = Choices.PAPER;
            const gameIndex = 1;
            await (0, chai_1.expect)(rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee })).to.be.revertedWith(constants_1.ERRORS.IndexOutOfBounds);
        });
        it('Should revert on player joining his own game', async function () {
            const { rps, p1, entryFee } = await (0, hardhat_network_helpers_1.loadFixture)(createGame);
            const p1Choice = Choices.PAPER;
            const gameIndex = 0;
            await (0, chai_1.expect)(rps.connect(p1).joinGame(p1.address, gameIndex, p1Choice, { value: entryFee })).to.be.revertedWith(constants_1.ERRORS.CannotJoinGame);
        });
        it('Should revert if game already has a second player', async function () {
            const { rps, p1, entryFee } = await (0, hardhat_network_helpers_1.loadFixture)(createGame);
            const [_, p2, p3] = await hardhat_1.ethers.getSigners();
            const p2Choice = Choices.PAPER;
            const p3Choice = Choices.ROCK;
            const gameIndex = 0;
            await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
            await (0, chai_1.expect)(rps.connect(p3).joinGame(p1.address, gameIndex, p3Choice, { value: entryFee })).to.be.revertedWith(constants_1.ERRORS.CannotJoinGame);
        });
    });
    describe('resolveGameP1', function () {
        it('Should revert on index out of bounds', async function () {
            const { rps, p1, clearChoice, entryFee } = await (0, hardhat_network_helpers_1.loadFixture)(createGame);
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const p2Choice = Choices.PAPER;
            const gameIndex = 0;
            await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
            const oufOfBoundsIndex = 1;
            await (0, chai_1.expect)(rps.connect(p1).resolveGameP1(oufOfBoundsIndex, clearChoice)).to.be.revertedWith(constants_1.ERRORS.IndexOutOfBounds);
        });
        it('Should revert if game doesnt have a second player', async function () {
            const { rps, p1, clearChoice } = await (0, hardhat_network_helpers_1.loadFixture)(createGame);
            await (0, chai_1.expect)(rps.connect(p1).resolveGameP1(0, clearChoice)).to.be.revertedWith(constants_1.ERRORS.NoSecondPlayer);
        });
        it('Should let p1 resolve the game', async function () {
            const { rps, p1, clearChoice, entryFee } = await (0, hardhat_network_helpers_1.loadFixture)(createGame);
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const gameIndex = 0;
            const p2Choice = Choices.PAPER;
            await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
            await (0, chai_1.expect)(await rps.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
        });
        it("Shouldn't let p1 resolve the game if doesn't have one", async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const gameIndex = 0;
            const gameClearChoice = 'test';
            await (0, chai_1.expect)(rps.connect(p1).resolveGameP1(gameIndex, gameClearChoice)).to.be.revertedWith(constants_1.ERRORS.IndexOutOfBounds);
        });
    });
    describe('resolveGameP2', function () {
        it("Shouldn't let p2 resolve the game if timer is still running", async function () {
            const Rps = await hardhat_1.ethers.getContractFactory('Rps');
            const rps = await Rps.deploy();
            const [p1] = await hardhat_1.ethers.getSigners();
            const clearChoice = Choices.PAPER + '-' + 'test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const entryFee = hardhat_1.ethers.utils.parseEther('0.1'); /* 0.1 Eth */
            await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const gameIndex = 0;
            const p2Choice = Choices.PAPER;
            await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
            await (0, chai_1.expect)(rps.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith(constants_1.ERRORS.TimerStillRunning);
        });
        it("Shouldn't let p2 resolve the game if game doesn't have a second player", async function () {
            const Rps = await hardhat_1.ethers.getContractFactory('Rps');
            const rps = await Rps.deploy();
            const [p1] = await hardhat_1.ethers.getSigners();
            const clearChoice = Choices.PAPER + '-' + 'test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const entryFee = hardhat_1.ethers.utils.parseEther('0.1'); /* 0.1 Eth */
            await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const gameIndex = 0;
            await (0, chai_1.expect)(rps.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith(constants_1.ERRORS.NoSecondPlayer);
        });
        it('Should clean up after resolve', async function () {
            const Rps = await hardhat_1.ethers.getContractFactory('Rps');
            const rps = await Rps.deploy();
            const [p1] = await hardhat_1.ethers.getSigners();
            const clearChoice = Choices.PAPER + '-' + 'test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const entryFee = hardhat_1.ethers.utils.parseEther('0.1'); /* 0.1 Eth */
            await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const gameIndex = 0;
            const p2Choice = Choices.PAPER;
            await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
            await rps.connect(p1).resolveGameP1(gameIndex, clearChoice);
            await (0, chai_1.expect)(rps.connect(p1).getGame(p1.address, gameIndex)).to.be.revertedWith(constants_1.ERRORS.IndexOutOfBounds);
        });
        it('Should let p2 resolve the game if the timer ran out', async function () {
            const Rps = await hardhat_1.ethers.getContractFactory('Rps');
            const rps = await Rps.deploy();
            const [p1] = await hardhat_1.ethers.getSigners();
            const clearChoice = Choices.PAPER + '-' + 'test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const entryFee = hardhat_1.ethers.utils.parseEther('0.1'); /* 0.1 Eth */
            const revealTimeout = await await rps.REVEAL_TIMEOUT();
            await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
            const [_, p2] = await hardhat_1.ethers.getSigners();
            const gameIndex = 0;
            const p2Choice = Choices.PAPER;
            await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
            await hardhat_1.network.provider.send('evm_increaseTime', [revealTimeout]);
            await hardhat_1.network.provider.send('evm_mine');
            const p2Bal = await p2.getBalance();
            await rps.connect(p2).resolveGameP2(p1.address, gameIndex);
            await (0, chai_1.expect)((await p2.getBalance()).sub(p2Bal)).to.be.approximately((0, utils_1.parseEther)('0.19'), (0, utils_1.parseEther)('0.01'));
            await (0, chai_1.expect)(rps.connect(p1).getGame(p1.address, gameIndex)).to.be.revertedWith(constants_1.ERRORS.IndexOutOfBounds);
        });
    });
    describe('getHashChoice', function () {
        it('Should return Scissors', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const choice = Choices.SCISSORS;
            const clearChoice = `${choice}-test`;
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            await (0, chai_1.expect)(await rps.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
        });
        it('Should return Paper', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const choice = Choices.PAPER;
            const clearChoice = `${choice}-test`;
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            await (0, chai_1.expect)(await rps.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
        });
        it('Should return Rock', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const choice = Choices.ROCK;
            const clearChoice = `${choice}-test`;
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            await (0, chai_1.expect)(await rps.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
        });
    });
    describe('chooseWinner', function () {
        it('Should pay p1 when paper and rock', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1, p2] = await hardhat_1.ethers.getSigners();
            const p1Choice = Choices.PAPER;
            const p2Choice = Choices.ROCK;
            const entryFee = (0, utils_1.parseEther)('0.1');
            await rps.connect(p1).rcv({ value: entryFee.mul(2) });
            const p1Bal = await p1.getBalance();
            await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);
            await (0, chai_1.expect)(await (await p1.getBalance()).sub(p1Bal)).to.approximately(entryFee.mul(2), (0, utils_1.parseEther)('0.05'));
        });
        it('Should pay p1 when rock and scissors', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1, p2] = await hardhat_1.ethers.getSigners();
            const p1Choice = Choices.ROCK;
            const p2Choice = Choices.SCISSORS;
            const entryFee = (0, utils_1.parseEther)('0.1');
            await rps.connect(p1).rcv({ value: entryFee.mul(2) });
            const p1Bal = await p1.getBalance();
            await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);
            await (0, chai_1.expect)(await (await p1.getBalance()).sub(p1Bal)).to.approximately(entryFee.mul(2), (0, utils_1.parseEther)('0.05'));
        });
        it('Should pay p1 when scissors and paper', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1, p2] = await hardhat_1.ethers.getSigners();
            const p1Choice = Choices.SCISSORS;
            const p2Choice = Choices.PAPER;
            const entryFee = (0, utils_1.parseEther)('0.1');
            await rps.connect(p1).rcv({ value: entryFee.mul(2) });
            const p1Bal = await p1.getBalance();
            await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);
            await (0, chai_1.expect)(await (await p1.getBalance()).sub(p1Bal)).to.approximately(entryFee.mul(2), (0, utils_1.parseEther)('0.05'));
        });
        it('Should pay both players when p1==p2', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1, p2] = await hardhat_1.ethers.getSigners();
            const p1Choice = Choices.PAPER;
            const p2Choice = Choices.PAPER;
            const entryFee = (0, utils_1.parseEther)('0.1');
            await rps.connect(p1).rcv({ value: entryFee.mul(2) });
            const p1Bal = await p1.getBalance();
            const p2Bal = await p2.getBalance();
            await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);
            await (0, chai_1.expect)(await (await p1.getBalance()).sub(p1Bal)).to.approximately(entryFee, (0, utils_1.parseEther)('0.008'));
            await (0, chai_1.expect)(await (await p2.getBalance()).sub(p2Bal)).to.approximately(entryFee, (0, utils_1.parseEther)('0.008'));
        });
    });
    describe('payoutWithAppliedTax', function () {
        it("Should revert if contract doesn't have enough tokens", async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const entryFee = ethers_1.utils.parseEther('1');
            await (0, chai_1.expect)(rps.payoutWithAppliedTax(p1.address, entryFee)).to.revertedWith(constants_1.ERRORS.NotEnoughMoneyInContract);
        });
        it('Should applay tax', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const initialEntryFee = hardhat_1.ethers.utils.parseEther('0.5');
            const TAX = await await rps.TAX_PERCENT();
            const payout = initialEntryFee.mul(2).sub(initialEntryFee.mul(2).div(100).mul(TAX));
            const expectedBal = initialEntryFee.mul(2).sub(payout);
            await rps.connect(p1).rcv({ value: initialEntryFee.mul(2) });
            await rps.payoutWithAppliedTax(p1.address, initialEntryFee);
            await (0, chai_1.expect)(await rps.getBalance()).to.equal(expectedBal);
        });
    });
    describe('removeGame', function () {
        it('Should remove a game and update its position', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1] = await hardhat_1.ethers.getSigners();
            const clearChoice = '2-test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const w1 = 0;
            const weiAmount = (0, utils_1.parseEther)('0.1'); /* 0.1 Eth */
            const weiAmount2 = (0, utils_1.parseEther)('0.2'); /* 0.1 Eth */
            await rps.connect(p1).makeGame(hashedChoice, { value: weiAmount });
            await rps.connect(p1).makeGame(hashedChoice, { value: weiAmount2 });
            await rps.connect(p1).removeGameP1(p1.address, w1);
            (0, chai_1.expect)(await (await rps.connect(p1).getGame(p1.address, w1)).entryFee).to.equal(weiAmount2);
        });
        it('Should forfeit if game has p2', async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1, p2] = await hardhat_1.ethers.getSigners();
            const clearChoice = '2-test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const w1 = 0;
            const weiAmount = (0, utils_1.parseEther)('0.1'); /* 0.1 Eth */
            await rps.connect(p1).makeGame(hashedChoice, { value: weiAmount });
            await rps.connect(p2).joinGame(p1.address, w1, Choices.PAPER, { value: weiAmount });
            const p2Bal = await p2.getBalance();
            await rps.connect(p1).removeGameP1(p1.address, w1);
            await (0, chai_1.expect)((await p2.getBalance()).sub(p2Bal)).to.be.approximately((0, utils_1.parseEther)('0.19'), (0, utils_1.parseEther)('0.01'));
        });
        it("Should revert if caller isn't the game owner", async function () {
            const { rps } = await (0, hardhat_network_helpers_1.loadFixture)(deployRps);
            const [p1, p2] = await hardhat_1.ethers.getSigners();
            const clearChoice = '2-test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const w1 = 0;
            const weiAmount = (0, utils_1.parseEther)('0.1'); /* 0.1 Eth */
            await rps.connect(p1).makeGame(hashedChoice, { value: weiAmount });
            await rps.connect(p2).joinGame(p1.address, w1, Choices.PAPER, { value: weiAmount });
            await (0, chai_1.expect)(rps.connect(p2).removeGameP1(p1.address, w1)).to.be.revertedWith(constants_1.ERRORS.CannotRemoveGame);
        });
    });
    describe('Concurrency Tests', function () {
        it('Should allow multiple games', async function () {
            const Rps = await hardhat_1.ethers.getContractFactory('Rps');
            const rps = await Rps.deploy();
            const [p1, p2] = await hardhat_1.ethers.getSigners();
            const gameIndex = 0;
            const p2Choice = Choices.PAPER;
            const clearChoice = Choices.PAPER + '-' + 'test';
            const hashedChoice = hardhat_1.ethers.utils.soliditySha256(['string'], [clearChoice]);
            const entryFee = hardhat_1.ethers.utils.parseEther('0.1');
            for (let i = 0; i < 100; i++) {
                await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
            }
            for (let i = 0; i < 100; i++) {
                await rps.connect(p2).joinGame(p1.address, i, p2Choice, { value: entryFee });
            }
            const p1Bal = await p1.getBalance();
            const p2Bal = await p2.getBalance();
            for (let i = 0; i < 100; i++) {
                (0, chai_1.expect)(await rps.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
            }
            (0, chai_1.expect)(await await rps.getBalance()).to.be.equal((0, utils_1.parseEther)('1'));
            (0, chai_1.expect)(await (await p1.getBalance()).sub(p1Bal)).to.be.approximately((0, utils_1.parseEther)('10'), (0, utils_1.parseEther)('1'));
            (0, chai_1.expect)(await (await p2.getBalance()).sub(p2Bal)).to.be.approximately((0, utils_1.parseEther)('10'), (0, utils_1.parseEther)('1'));
        });
    });
});
