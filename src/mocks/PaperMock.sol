// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PaperMock is ERC20 {
    constructor() ERC20("PAPER", "PAPER") {}

    function mintTo(address target, uint256 amount) public {
        _mint(target, amount);
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    receive() external payable {} 
}
