const RecipientRampableModel = require("../models/RecipientRampable.model");
const { logger } = require("../utils/Email");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { isEmpty } = require("../utils");
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


async function generateOfframp(withdraw) {

    //usdc-ethereum probar con este es el unico que tenemos en uso y ala vez tiene usd en currencies
}





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
    getRecipients, getRecipientMongo, getAccountData, convertCryptoToUSD
};