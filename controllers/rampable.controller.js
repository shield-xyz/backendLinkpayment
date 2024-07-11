const RecipientRampableModel = require("../models/RecipientRampable.model");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { isEmpty, response, getTokenBalance, sendToken, convertToBlockchainUnits } = require("../utils");
const withdrawsModel = require("../models/withdraws.model");
const assetModel = require("../models/asset.model");
const { respondToSslCheck } = require("@slack/bolt/dist/receivers/ExpressReceiver");
const OffRampModel = require("../models/rampable/offRamp.model");
const logger = require("node-color-log");
const dateSignature = new Date().toISOString();


const getSignature = (body, method, clientID = process.env.RAMPABLE_CLIENT_SECRET, privateKeyPath = './shield-payments.pem') => {
    // Leer la clave privada desde el archivo
    const myPemKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');

    // Minify the HTTP body
    const minfiedBodyEncrypted = JSON.stringify(body || {});

    // Create a SHA-256 hash object
    const hash = crypto.createHash('sha256');

    // Add the data to the hash object
    hash.update(minfiedBodyEncrypted);

    // Calculate the SHA-256 hash
    const hexSHA = hash.digest('hex');
    const minfiedBodyEncryptedLower = hexSHA.toLowerCase();

    // Generate the string to be signed
    let stringToSign = '';

    // POST, PATCH, PUT = <X-CLIENT-ID> + “:“ + <X-TIMESTAMP> + “:“ + LowerCase(HexEncode(SHA-256(Minify(<HTTP BODY>))))
    // GET, DELETE = <X-CLIENT-ID> + “:“ + <X-TIMESTAMP>
    switch (method) {
        case 'GET':
        case 'DELETE':
            stringToSign = `${clientID}:${dateSignature}`;
            break;
        case 'POST':
        case 'PATCH':
        case 'PUT':
            stringToSign = `${clientID}:${dateSignature}:${minfiedBodyEncryptedLower}`;
            break;
        default:
            throw new Error('Method not allowed');
    }

    // Create a signer object
    const sign = crypto.createSign('RSA-SHA256');

    // Update the signer object with the data to be signed
    sign.update(stringToSign);

    // Sign the data
    const signature = sign.sign({ key: myPemKey, padding: crypto.constants.RSA_PKCS1_PADDING }, 'base64');

    return signature;
}

const rampableRequest = async (endpoint, method = 'GET', body = {}, searchParams = {}) => {
    const url = `${process.env.RAMPABLE_URL}${endpoint}`;
    const signature = getSignature(body, method);
    const options = {
        method,
        headers: {
            "X-CLIENT-ID": process.env.RAMPABLE_CLIENT_SECRET,
            'X-SIGNATURE': signature,
            'X-TIMESTAMP': dateSignature,
            'Content-Type': 'application/json'
        }, searchParams
    };
    if (!isEmpty(body)) {
        options.body = JSON.stringify(body);
    }
    // console.log({
    //     "X-CLIENT-ID": process.env.RAMPABLE_CLIENT_SECRET,
    //     'X-SIGNATURE': signature,
    //     'X-TIMESTAMP': dateSignature,
    //     'Content-Type': 'application/json'
    // }, body, url)
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
};


/**
 * Creates a recipient by sending a POST request to the Rampable API.
 * 
 * @async
 * @function createRecipients
 * @param {Object} user - The user object containing user details.
 * @param {string} user.name - The name of the user.
 * @param {string} user.email - The email of the user.
 * @param {Object} bank - The bank object containing bank details.
 * @param {string} [bank.currency="USD"] - The currency of the bank account (default is "USD").
 * @param {string} bank.country - The country of the bank.
 * @param {string} bank.accountNumber - The account number of the bank.
 * @param {string} bank.accountName - The account name of the bank.
 * @param {string} bank.bankName - The name of the bank.
 * @param {string} city - The city of the recipient.
 * @param {string} address - The address of the recipient.
 * @param {string} postCode - The postal code of the recipient.
 * @returns {Promise<Object>} The response from the server.
 * @throws Will throw an error if the fetch request fails.
 */
async function createRecipients(user, userId, bank, city, address, postCode, country = "UNITED STATES") {

    try {
        let body = {
            "name": user.name,
            "recipientType": "Individual",
            "email": user.email,
            "organizationId": "665eb972de1c542dbcd31200",
            "city": city,
            "address": address,
            "postCode": postCode,
            "bank": {
                "accountName": bank.accountName,
                "accountNumber": bank.accountNumber,
                "currency": bank.currency,
                "country": country,
                "achNumber": bank.achNumber,
                "accountType": bank.accountType,
            }

        };
        let data = await rampableRequest('recipient', "POST", body);

        if (data.statusCode === 200) {
            let re = await RecipientRampableModel.create({ ...data.data, userId });
            return re;
        } else {
            logger.info("response from server: " + JSON.stringify(data));
            return {};
        }
    } catch (error) {
        console.log(error, "error")
    }

}

async function getRecipientMongo(filter = {}) {
    let recipients = await RecipientRampableModel.find(filter);
    return recipients;
}

/**
 * Creates a recipient by sending a POST request to the Rampable API.
 * 
 * @async
 * @function createRecipients
 * @param {Object} user - The user object containing user details.
 * @param {string} user.name - The name of the user.
 * @param {string} user.email - The email of the user.
 * @param {Object} bank - The bank object containing bank details.
 * @param {string} [bank.currency="USD"] - The currency of the bank account (default is "USD").
 * @param {string} bank.country - The country of the bank.
 * @param {string} bank.accountNumber - The account number of the bank.
 * @param {string} bank.accountName - The account name of the bank.
 * @param {string} bank.bankName - The name of the bank.
 * @param {string} city - The city of the recipient.
 * @param {string} address - The address of the recipient.
 * @param {string} postCode - The postal code of the recipient.
 * @returns {Promise<Object>} The response from the server.
 * @throws Will throw an error if the fetch request fails.
 */
async function getRecipients(email) {

    let data = await rampableRequest('recipient', "GET", {}, {
        'search': email,
        'limit': '10',
        'currency': 'INR',
        'page': '1',
        'sort': '-createdAt',
    });
    logger.info("response from server: " + JSON.stringify(data));
    return data;
}
const getCurrencies = async () => {
    // https://staging.rampable.co/v1/reference/cryptos
    let data = await rampableRequest('reference/cryptos', "GET", {},);
    return data;
}

/**
 * Fetches account data from a backend API using the provided email.
 * 
 * @async
 * @function getAccountData
 * @param {string} email - The email address to search for account data.
 * @returns {Promise<Object>} The response from the backend API containing account data.
 * @throws Will throw an error if the fetch request fails.
 */
async function getAccountData(email) {
    if (process.env.API_BACK_ACCOUNTS) {
        let response = await fetch(process.env.API_BACK_ACCOUNTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        });
        response = await response.json();
        logger.info("response from server: " + JSON.stringify(response));
        return response;
    } else {
        logger.info("api_back_account not found");
        return {};
    }
}

async function createOfframp(inputAmount, senderName, senderEmail, receiverId, inputCurrency, blockchainType, outputCurrency = "USD", reason = "reason", description = "off ramp automatic api - shield.") {
    let body = {
        inputAmount: inputAmount,
        senderName: senderName,
        senderEmail: senderEmail,
        receiverId: receiverId,
        inputCurrency: inputCurrency,
        // blockchainType: blockchainType,
        outputCurrency: outputCurrency,
        reason: reason,
        description: description,
    };

    let data = await rampableRequest('offramp', "POST", body);
    return data;
}

async function generateOfframp(userId, withdrawId) {
    let withdraw = await withdrawsModel.findOne({ _id: withdrawId });
    try {
        if (withdraw) {
            switch (withdraw.assetId) {//ver que moneda es la que recibio
                case "usdt-ethereum":
                case "usdc-ethereum":
                case "usdc-polygon":
                case "usdt-polygon":
                    let asset = await assetModel.findOne({ assetId: withdraw.assetId });
                    //validar balance de token y red para transferir lo que si tenemos .
                    let balance = await getTokenBalance(process.env.ADDRESS_WALLET, asset.address, asset.decimals, asset.networkId)
                    let amount = parseFloat(withdraw.amount.toFixed(4));
                    console.log(balance, "balance", amount)
                    if (balance < amount && amount > 0) {
                        return response("Error not have balance " + amount + ", balance is : " + balance + " " + asset.symbol)
                    }
                    //generar offramp,
                    let recipient = await RecipientRampableModel.find({ userId: userId });
                    // console.log(recipient, recipient.length);
                    // ! deberiamos validar cual de todas los recipients quiere usar
                    recipient = recipient[0];
                    let token = withdraw.assetId.split("-");
                    let offramp = await createOfframp(amount, recipient.name, recipient.email, recipient.id, withdraw.assetId, token[1]);
                    logger.fontColorLog("green", JSON.stringify(offramp))
                    if (offramp.statusCode == 201 || offramp.statusCode == 200) {
                        offramp = new OffRampModel(offramp.data);
                        offramp.userId = userId;
                        offramp.withdrawId = withdrawId;
                        await offramp.save();
                        offramp.tx = await sendToken(offramp.payOutWallet, asset.address, offramp.inputAmountExact, asset.decimals, asset.networkId)
                        await offramp.save();
                        withdraw.offRampId = offramp.id;
                        await withdraw.save()
                        return response("offramp created successfully");
                    } else {
                        return response(offramp.message, "error");
                    }

                    // verificar status offramp? //preguntar si hay alguna forma de weeebhook o algo asi 
                    //marcar este withdraw como in progress y agregar que esta siendo procesado por rampable-api

                    break;
                default://si es alguna que pueda pasar a rampable (bitcoin no es aceptada todavia por ejemplo)
                    logger.error("Error withdraw diferent assetId " + withdraw.assetId);
                    return response("rampable not  avalaible for asset id : " + withdraw.assetId, "error");
            }
        }
    } catch (error) {
        let er = "Error withdraw diferent assetId " + withdrawId + " " + error.message;
        logger.error(er);
        return response(er, "error");
    }

}

// generateOfframp("667477f6769e23782b7c2984", "668d394a44de36d0ec054d56")





const convertCryptoToUSD = async (accountId, amount, cryptoCurrency, fiat_currency = "USD") => {

    let body = {
        amount,
        crypto_currency: cryptoCurrency,
        fiat_currency: fiat_currency
    };
    console.log(body, "body convert cripto")
    const conversion = await rampableRequest(`accounts/${accountId}/conversions`, 'POST', body);

    return conversion;
};

module.exports = {
    getSignature,
    createRecipients,
    getRecipients, getRecipientMongo, getAccountData, convertCryptoToUSD, generateOfframp
};