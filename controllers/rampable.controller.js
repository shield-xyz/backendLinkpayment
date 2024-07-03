const RecipientRampableModel = require("../models/RecipientRampable.model");
const { logger } = require("../utils/Email");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const generateAssymetricSignature = ({ body, timeStamp, method, clientID, privateKeyPath }) => {
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
            stringToSign = `${clientID}:${timeStamp}`;
            break;
        case 'POST':
        case 'PATCH':
        case 'PUT':
            stringToSign = `${clientID}:${timeStamp}:${minfiedBodyEncryptedLower}`;
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

    return console.log(signature);
}

let token = "PSQCf09Ejfh5E8lBHgTWkNDkyywkR1RM+0kCmhPXKY/0Uz6Io5S3DDQSr1BNNzy7qczLkyVuYcsgDLDS5D7Bu5BG3X2d0KxmqGFRXSsCvTtj1RhGD6XxYcLWAbVknlwpe9/nMdyehfqesICsTBtL/SZ1uz5xxbRuA7JD1qFeAJMfFwhPLvOZHebWmjNLGFqmfzEGAQTscPZdXVUsEQSG8bZRMKxVJq7wShGDrpWIWNVLqazkOCJQwvqKq+18teuZUvgsNb1aEoN78gMZ8xjaJQ4dsoflfUXvnfq3fn6s/3nU3sMWpjedjdriNX+sVpbi06/62OuRFFFU2FpkzKewNw==";

// generateAssymetricSignature({
//     body: { message: 'Nehuen fortes' },
//     timeStamp: '2024-07-03T00:00:00Z',
//     method: 'POST',
//     clientID: process.env.RAMPABLE_CLIENT_SECRET,
//     privateKeyPath: './shield-payments.pem' // Reemplaza con la ruta correcta de tu archivo de clave privada
// });


//logica de rampable 
async function getToken() {
    return token;
}
async function login() {

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
async function createRecipients(user, bank, city, address, postCode, country = "UNITED STATES") {

    try {
        let body = {

            "name": "testaddprodshield",
            "recipientType": "Individual",
            "email": "testaddprod@gmail.com",
            "organizationId": "665eb972de1c542dbcd31200",
            "city": "BOSTON",
            "address": "asd",
            "postCode": "4123",
            "bank": {
                "accountName": "Bababa",
                "accountNumber": "Uwuwhw",
                "currency": "USD",
                "country": "UNITED STATES",
                "achNumber": "123123123",
                "accountType": "Checking"
            }

        };
        // console.log(body);
        // return
        let response = await axios.post('https://staging.rampable.co/v1/recipient',
            body,
            {
                headers: {
                    "X-CLIENT-ID": "f52f216d07614fc8ae3f81a331ea8b95527212",
                    'X-SIGNATURE': "PSQCf09Ejfh5E8lBHgTWkNDkyywkR1RM+0kCmhPXKY/0Uz6Io5S3DDQSr1BNNzy7qczLkyVuYcsgDLDS5D7Bu5BG3X2d0KxmqGFRXSsCvTtj1RhGD6XxYcLWAbVknlwpe9/nMdyehfqesICsTBtL/SZ1uz5xxbRuA7JD1qFeAJMfFwhPLvOZHebWmjNLGFqmfzEGAQTscPZdXVUsEQSG8bZRMKxVJq7wShGDrpWIWNVLqazkOCJQwvqKq+18teuZUvgsNb1aEoN78gMZ8xjaJQ4dsoflfUXvnfq3fn6s/3nU3sMWpjedjdriNX+sVpbi06/62OuRFFFU2FpkzKewNw==",
                    'X-TIMESTAMP': "2024-07-02T00:00:00Z",
                    'Content-Type': 'application/json'
                }
            }
        );
        // console.log(response)
        response = response.data;
        if (response.statusCode === 200) {
            console.log(response)
            let re = await RecipientRampableModel.create(response.data);
            return re;
        } else {
            logger.info("response from server: " + JSON.stringify(response));
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
    let token = await getToken();
    let static_token = "";
    let response = await fetch('https://sandbox.rampable.co/v1/recipient', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        searchParams: {
            // 'search': email,
            'limit': '10',
            'currency': 'INR',
            'page': '1',
            'sort': '-createdAt',
        }
    })
    response = await response.json();
    logger.info("response from server: " + JSON.stringify(response));
    return response;
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



// getRecipients("asd").then(res => { console.log(res, "RESPONSE") });
module.exports = {
    getToken,
    login,
    createRecipients,
    getRecipients, getRecipientMongo, getAccountData
};