const RecipientRampableModel = require("../models/RecipientRampable.model");
const { logger } = require("../utils/Email");


//logica de rampable 
async function getToken() {
    return "";
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
async function createRecipients(user, bank, city, address, postCode) {
    let token = await getToken();
    let body = {
        "name": user.name,
        "email": user.email,
        "bank": {
            "currency": bank.currency ?? "USD",
            "country": bank.country,
            "accountNumber": bank.accountNumber,
            "accountName": bank.accountName,
            "bankName": bank.bankName,
            "ifsc": "",
        },
        "city": city,
        "postCode": postCode,
        "address": address,
    };
    let response = await fetch('https://sandbox.rampable.co/v1/recipient', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    response = await response.json();
    if (response.statusCode === 200) {
        let re = await RecipientRampableModel.create(response.data);
    }
    logger.info("response from server: " + JSON.stringify(response));
    return response;
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
            'x-static-token': static_token,
        },
        searchParams: {
            'search': email,
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




module.exports = {
    getToken,
    login,
    createRecipients,
    getRecipients, getRecipientMongo, getAccountData
};