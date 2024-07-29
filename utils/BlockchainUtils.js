const { ethers } = require("hardhat");
const hardhatConfig = require("../hardhat.config");
const logger = require("node-color-log");
// ABI del contrato ERC-20, puedes obtener esto del contrato del token
const erc20Abi = require("../artifacts/contracts/tokenErc20.sol/tokenErc20.json").abi
const axios = require("axios")
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
    logger.info({ walletAddress, tokenAddress, decimals, networkName, network })
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
async function getData(networkName, token, to, amount, decimals) {
    const abi = [
        "function transfer(address to, uint amount)"
    ];

    // Dirección del contrato
    const contractAddress = token;
    let network = getNetworkHardhat(networkName);
    // Obtener la configuración de la red desde hardhat.config.js
    if (!network) {
        throw new Error(`Network ${networkName} is not configured in hardhat.config.js`);
    }
    // Conectar a la red especificada usando la URL del proveedor RPC
    const provider = new ethers.providers.JsonRpcProvider(network.url);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    try {
        // Datos de la transacción
        const toAddress = to;
        amount = ethers.utils.parseUnits(amount + "", decimals); // 1000 USDT con 6 decimales

        // Generar el data
        const data = contract.interface.encodeFunctionData("transfer", [toAddress, amount]);

        console.log("Data de la transacción:", data);
        return data;
    } catch (error) {
        console.log(error)
        return error;
    }

}
// Obtener el precio del gas desde Infura
async function getGasPrices() {
    const url = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
    const response = await axios.post(url, {
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 1
    });
    const gasPrice = ethers.BigNumber.from(response.data.result);
    return gasPrice;
}


async function getBaseFee(provider) {
    const block = await provider.getBlock("latest");
    return ethers.BigNumber.from(block.baseFeePerGas);
}
// async function calculateGasLimit(networkName, from, to, token, amount, decimals) {
//     let network = getNetworkHardhat(networkName);
//     const provider = new ethers.providers.JsonRpcProvider(network.url);
//     try {
//         const baseFee = await getBaseFee(provider);
//         let data = await getData(networkName, token, to, amount, decimals);

//         // Configurar las tarifas
//         const maxPriorityFeePerGas = ethers.utils.parseUnits('2.0', 'gwei'); // Ejemplo de prioridad de 2 Gwei
//         const maxFeePerGas = baseFee.add(maxPriorityFeePerGas);
//         let gasPrice = await getGasPrices();
//         // Crear una transacción de prueba para estimar el gas
//         const transaction = {
//             from,
//             to,
//             data: data,
//             gasPrice: gasPrice,
//             // maxPriorityFeePerGas,
//             // maxFeePerGas,
//             // gasLimit: ethers.utils.hexlify(300000) // Aumentar el límite de gas a 300,000
//         };

//         // Estimar el gas necesario
//         const gasLimit = await provider.estimateGas(transaction);
//         return { gasLimit: gasLimit.toString(), maxPriorityFeePerGas, maxFeePerGas };
//     } catch (error) {
//         console.error('Error calculando el límite de gas:', error);
//         throw error;
//     }
// }
async function estimateGas(from, to, data) {
    const url = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
    try {
        const response = await axios.post(url, {
            jsonrpc: "2.0",
            method: "eth_estimateGas",
            params: [{
                from: from,
                to: to,
                data: data
            }],
            id: 1
        });

        const gasEstimate = response.data.result;
        return gasEstimate;
    } catch (error) {
        console.error('Error estimando el gas:', error.response ? error.response.data : error.message);
        throw error;
    }
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
    if (!network) {
        throw new Error(`Network ${networkName} is not configured in hardhat.config.js`);
    }
    const provider = new ethers.providers.JsonRpcProvider(network.url);
    const signer = new ethers.Wallet(network.accounts[0], provider);
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
    const fromAddress = signer.address;

    // Verificar el balance del ETH
    const balance = await provider.getBalance(fromAddress);
    const requiredEth = ethers.utils.parseEther('0.0002'); // Ajusta esto según el gas estimado y maxFeePerGas

    if (balance.lt(requiredEth)) {
        throw new Error('Balance insuficiente para cubrir las tarifas de gas');
    }

    // Obtener los datos de la transacción
    const data = await getData(networkName, tokenAddress, to, amount, decimals);
    // Estimar el gas
    let gasLimit = 0// await estimateGas(fromAddress, to, data, network.url);
    gasLimit = 96046;

    const gasPrice = await getGasPrices();
    console.log(gasLimit, gasPrice.toNumber());
    const tx = await tokenContract.transfer(to, convertToBlockchainUnits(amount, decimals), {
        gasLimit: ethers.BigNumber.from(gasLimit),
        gasPrice: gasPrice
    });

    console.log(tx);
    await tx.wait();
    return tx;
}
module.exports = {
    erc20Abi, getTokenBalance, sendToken, convertToBlockchainUnits, getNetworkHardhat
}