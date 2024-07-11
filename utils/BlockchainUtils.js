const { ethers } = require("hardhat");
const hardhatConfig = require("../hardhat.config")
// ABI del contrato ERC-20, puedes obtener esto del contrato del token
const erc20Abi = require("../artifacts/contracts/tokenErc20.sol/tokenErc20.json").abi

function getNetworkHardhat(networkName) {
    let network = null;
    switch (networkName) {

        case "ethereum":
            network = hardhatConfig.networks["mainnet"];
            if (process.env.BLOCKCHAIN_PROD == "false") //si estamos en dev
                network = hardhatConfig.networks["sepolia"];
            break;
        case "polygon":
            network = hardhatConfig.networks["polygon"];
            if (process.env.BLOCKCHAIN_PROD == "false") //si estamos en dev
                network = hardhatConfig.networks["polygon_amoy"];
            break;
        // case "tron":
        //     network = hardhatConfig.networks["mainnet"]; break;
        // case "bitcoin":
        //     network = hardhatConfig.networks["mainnet"]; break;
        default:
            return null;
    }
    return network;
}
async function getTokenBalance(walletAddress, tokenAddress, decimals, networkName) {
    // console.log(networkName, (hardhatConfig))
    let network = getNetworkHardhat(networkName);
    // Obtener la configuración de la red desde hardhat.config.js
    if (!network) {
        throw new Error(`Network ${networkName} is not configured in hardhat.config.js`);
    }
    // Conectar a la red especificada usando la URL del proveedor RPC
    const provider = new ethers.providers.JsonRpcProvider(network.url);
    // Crear una instancia del contrato del token
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    // Obtener el balance del token en la dirección especificada
    const balance = await tokenContract.balanceOf(walletAddress);
    // Convertir el balance a un formato legible (por ejemplo, a ether si el token tiene 18 decimales)
    const formattedBalance = ethers.utils.formatUnits(balance, decimals); // Asegúrate de usar los decimales correctos del token

    return formattedBalance;
}

/**
 * Convierte un número a su representación en unidades de blockchain añadiendo decimales.
 * @param {number|string} value - El valor a convertir.
 * @param {number} decimals - La cantidad de decimales a añadir.
 * @return {string} - El valor convertido como string.
 */
function convertToBlockchainUnits(value, decimals) {
    // Convertir el número a una cadena y añadir los decimales
    return ethers.utils.parseUnits(value.toString(), decimals).toString();
}
async function sendToken(to, tokenAddress, amount, decimals, networkName) {
    let network = getNetworkHardhat(networkName);
    // Obtener la configuración de la red desde hardhat.config.js
    if (!network) {
        throw new Error(`Network ${networkName} is not configured in hardhat.config.js`);
    }
    const provider = new ethers.providers.JsonRpcProvider(network.url);
    // Crear un signer usando la clave privada y el proveedor
    const signer = new ethers.Wallet(network.accounts[0], provider);
    // Crear una instancia del contrato del token
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
    let tx = await tokenContract.transfer(to, convertToBlockchainUnits(amount, decimals));
    console.log(tx);
    await tx.wait();
    return tx;
}
module.exports = {
    erc20Abi, getTokenBalance, sendToken, convertToBlockchainUnits
}