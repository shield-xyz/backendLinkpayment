// const TronWeb = require('tronweb'); // there is no types for tronweb

const logger = require('node-color-log');
const fetch = require('node-fetch');
const twilio = require('twilio');


async function sendMessageTwilio(number, amount, type = 1) {
    const accountSid = process.env.TWILIO_ID; // Tu SID de Twilio
    const authToken = process.env.TWILIO_TOKEN; // Tu token de Twilio
    const client = twilio(accountSid, authToken);
    const fromNumber = process.env.TWILIO_FROM_NUMBER; // Tu número de WhatsApp de Twilio (en formato: 'whatsapp:+1234567890')

    const toNumber = `whatsapp:+${number}`; // Utiliza el número proporcionado en el cuerpo de la solicitud
    // ID del template aprobado en Twilio
    const templateSid = 'HX27407a93de4783ea28743fb0fe5982b9'; // Reemplaza con el SID de tu template aprobado
    // Parámetros del template
    const templateParams = {
        '1': amount // Utiliza el monto proporcionado en el cuerpo de la solicitud
    };
    let body = "";
    switch (type) {
        case 1:
            body = `Hello, we have successfully received your transfer of ${amount}. Thank you for your transaction. Your current balance is now updated.`;
            break;
        case 2:
            body = `Wire transfer initiated, We have initiated the bank transfer of ${amount}`; break;
    }
    try {
        let resp = await client.messages.create({
            from: fromNumber,
            to: toNumber,
            // contentSid: templateSid,
            // contentVariables: JSON.stringify(templateParams),
            body
        });
        logger.info(resp);
        return { response: resp, status: "success" };
    } catch (error) {
        return { response: { error, msg: error.message }, status: "success" };
    }

}


// Exportar todas las funciones del archivo automáticamente
module.exports = {
    sendMessageTwilio,
};



