const logger = require('node-color-log');
const fetch = require('node-fetch');
require('dotenv').config();
const axios = require('axios');
const apiToken = process.env.MAY_API_TOKEN;
const productId = process.env.MAY_API_PRODUCTID;
const phoneId = process.env.MAY_API_PHONEID;

async function sendMessageTwilio(number, amount, type = 1) {
    try {
        let message = "";
        if (type == 1) {
            message = "Hello, we have successfully received your transfer of " + amount + " . Thank you for your transaction. Your current balance is now updated."

        } else {
            message = "Hello, we have initiated your bank transfer of " + amount + ". Thank you for your patience."
        }
        sendMessageMay(number, message);
        return { status: "success", response: "Message sent " + number }
    } catch (error) {
        return { status: "error", response: error.message }
    }
}

async function sendMessageMay(phoneNumber, message) {
    const url = `https://api.maytapi.com/api/${productId}/${phoneId}/sendMessage`;

    const data = {
        to_number: phoneNumber,
        message: message,
        type: 'text'
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'x-maytapi-key': apiToken
            }
        });

        console.log('Message sent:', response.data);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function getWhatsAppGroups(body = {}) {
    try {
        let response = await axios.get(`https://api.maytapi.com/api/${productId}/${phoneId}/getGroups`, {
            headers: {
                'x-maytapi-key': apiToken
            }
        });
        response.data.data = response.data.data.map(x => { return { id: x.id, name: x.name } })
        return response.data;

    } catch (error) {
        console.error('Error fetching WhatsApp groups:', error);
        throw error;
    }
}

async function sendGroupMessage(message, groupId = process.env.ID_GROUP_WPP) {
    const url = `https://api.maytapi.com/api/${productId}/${phoneId}/sendMessage`;

    const data = {
        to_number: groupId,
        message: message,
        type: 'text'
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'x-maytapi-key': apiToken
            }
        });

        console.log('Message sent to group:', response.data);
    } catch (error) {
        console.error('Error sending message to group:', error);
    }
}
// sendMessageTwilioGroup("541128568076", "19 usdt", 1);
// sendGroupMessage("si, ves esto es porque si se puede enviar mensajes al grupo.")
module.exports = {
    sendMessageTwilio, sendMessageMay, sendGroupMessage, getWhatsAppGroups
};
