const logger = require('node-color-log');
const fetch = require('node-fetch');
require('dotenv').config();

async function sendMessageTwilio(number, amount, type = 1) {
    const accountSid = process.env.TWILIO_ID; // Tu SID de Twilio
    const authToken = process.env.TWILIO_TOKEN; // Tu token de Twilio
    const client = require('twilio')(accountSid, authToken);
    const fromNumber = process.env.TWILIO_FROM_NUMBER; // Tu número de WhatsApp de Twilio (en formato: 'whatsapp:+1234567890')

    const toNumber = `whatsapp:+${number}`; // Utiliza el número proporcionado en el cuerpo de la solicitud


    let templateSid = 'HXe1a6fcea5654ab826f53316d078cd39f'; // Reemplaza con el SID de tu template aprobado
    if (type == 1) {
        templateSid = "HXe1a6fcea5654ab826f53316d078cd39f";
    } else {
        templateSid = "HX44731b7c3418b8e07b462d38afec8a8d";
    }
    try {
        let resp = await client.messages.create({
            contentSid: templateSid,
            contentVariables: JSON.stringify({ 1: amount }),
            from: "MGf4ddbc312cf921cb40a5eac53a13ec7d",
            to: toNumber
        });
        logger.info(resp);
        return { response: resp, status: "success" };
    } catch (error) {
        console.error('Error sending message:', error);
        return { response: { error, msg: error.message }, status: "failure" };
    }
}

async function sendMessageTwilioGroup(number, amount, type = 1) {
    const accountSid = process.env.TWILIO_ID; // Tu SID de Twilio
    const authToken = process.env.TWILIO_TOKEN; // Tu token de Twilio
    const client = require('twilio')(accountSid, authToken);
    const fromNumber = process.env.TWILIO_FROM_NUMBER; // Tu número de WhatsApp de Twilio (en formato: 'whatsapp:+1234567890')

    const toNumber = `whatsapp:+${number}`; // Utiliza el número proporcionado en el cuerpo de la solicitud
    const groupID = "+16316838567-5491128568076:13@c.us"

    let templateSid = 'HXe1a6fcea5654ab826f53316d078cd39f'; // Reemplaza con el SID de tu template aprobado
    if (type == 1) {
        templateSid = "HXe1a6fcea5654ab826f53316d078cd39f";
    } else {
        templateSid = "HX44731b7c3418b8e07b462d38afec8a8d";
    }
    try {
        // let resp = await client.messages.create({
        // contentSid: templateSid,
        // contentVariables: JSON.stringify({ 1: amount }),
        //     from: "MGf4ddbc312cf921cb40a5eac53a13ec7d",
        //     to: toNumber
        // });
        const resp = await client.messages.create({
            from: fromNumber,
            to: `whatsapp:${groupID}`, // El identificador del grupo de WhatsApp
            contentSid: templateSid,
            contentVariables: JSON.stringify({ 1: amount }),
            body: "algo"
        });
        logger.info(resp);
        return { response: resp, status: "success" };
    } catch (error) {
        console.error('Error sending message:', error);
        return { response: { error, msg: error.message }, status: "failure" };
    }
}

// sendMessageTwilioGroup("541128568076", "19 usdt", 1);

module.exports = {
    sendMessageTwilio,
};
