const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

const erc20Abi = [
    "function transfer(address to, uint256 amount)"
];
const INFURA_PROJECT_ID = process.env.INFURA_APIKEY; // Reemplaza con tu ID de proyecto de Infura

// Obtener los datos de la transacción
async function getData(token, to, amount, decimals) {
    const contract = new ethers.Contract(token, erc20Abi);
    const data = contract.interface.encodeFunctionData("transfer", [to, ethers.utils.parseUnits(amount.toString(), decimals)]);
    return data;
}

// Estimar el gas usando eth_estimateGas
async function estimateGas(from, to, data, providerUrl) {
    const url = `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
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
        console.log(response.data, "data")
        const gasEstimate = response.data.result;
        return gasEstimate;
    } catch (error) {
        console.error('Error estimando el gas:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Obtener el precio del gas desde Infura
async function getGasPrices() {
    const url = `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
    const response = await axios.post(url, {
        jsonrpc: "2.0",
        method: "eth_gasPrice",
        params: [],
        id: 1
    });
    const gasPrice = ethers.BigNumber.from(response.data.result);
    return gasPrice;
}

// Convertir la cantidad a unidades de blockchain
function convertToBlockchainUnits(amount, decimals) {
    return ethers.utils.parseUnits(amount.toString(), decimals);
}

// Obtener la configuración de la red desde Hardhat
function getNetworkHardhat(networkName) {
    const networks = {
        mainnet: {
            url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
            accounts: [process.env.PRIVATE_KEY] // Asegúrate de tener tu clave privada en el archivo .env
        },
        // Agrega más redes según sea necesario
    };
    return {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`,
        accounts: [process.env.PRIVATE_KEY]
    };
}

// Función para enviar tokens
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
    const data = await getData(tokenAddress, to, amount, decimals);
    // Estimar el gas
    let gasLimit = await estimateGas(fromAddress, to, data, network.url);
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

// Ejemplo de uso
const toAddress = '0xfe4784a48EFcd7B4f635D05A5ce0E687Efbdd4F7';
const tokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const amount = '1'; // Cantidad de tokens a enviar
const decimals = 6; // Decimales del token
const networkName = 'mainnet';

sendToken(toAddress, tokenAddress, amount, decimals, networkName)
    .then(tx => {
        console.log('Transacción enviada:', tx);
    })
    .catch(error => {
        console.error('Error enviando la transacción:', error);
    });
