require('dotenv').config();
const { ethers } = require('hardhat');
const abi = require("../../artifacts/contracts/tokenErc20.sol/tokenErc20.json").abi
async function main() {
    // Obtén el signer (cuenta desde la cual harás la llamada)
    const [signer] = await ethers.getSigners();
    // Dirección del contrato desde el archivo .env
    const contractAddress = process.env.TOKEN_ERC20_POLYGON_AMOY;
    // Instancia del contrato
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const amount = "100000";

    // Llamada a la función del contrato
    const tx = await contract.mint(process.env.ADDRESS_WALLET, ethers.utils.parseUnits(amount, 6)); // Sustituye "42" por el parámetro que quieras pasar
    await tx.wait(); // Espera a que la transacción se confirme

    console.log("Function called, transaction hash:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
