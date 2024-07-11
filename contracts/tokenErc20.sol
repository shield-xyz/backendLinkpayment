// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract tokenErc20 is ERC20, ERC20Permit {
    constructor() ERC20("UsdCFakeN", "USDCF") ERC20Permit("USDC fake") {
        _mint(msg.sender, 100000);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
