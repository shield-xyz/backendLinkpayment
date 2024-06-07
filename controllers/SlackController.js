const { WebClient } = require('@slack/web-api');
const { App } = require('@slack/bolt');

const channelId = process.env.SLACK_CHANNEL;
const web = new WebClient(process.env.SLACK_TOKEN);
const app = new App({
    token: process.env.SLACK_TOKEN, // Reemplaza con tu token
    signingSecret: process.env.SLACK_CODE, // Reemplaza con tu signing secret
    channel: channelId,
});

// Escucha todos los mensajes en los canales
app.message(async ({ message, say }) => {
    console.log(`Mensaje recibido: ${message.text}`);
    // Puedes hacer algo con el mensaje aquí, por ejemplo, responder
    await say(`Recibí tu mensaje: ${message.text}`);
});

// Función para obtener los mensajes del canal
async function fetchMessages() {
    try {
        // Llama a la API de Slack para obtener el historial de mensajes del canal
        const result = await web.conversations.history({
            channel: channelId,
        });

        // Procesa los mensajes recibidos
        result.messages.forEach((message) => {
            console.log(`Mensaje: ${message.text}`);
        });
    } catch (error) {
        console.error(error);
    }
}
// Función para listar los canales
async function listChannels() {
    try {
        // Llama a la API de Slack para obtener la lista de canales
        const result = await web.conversations.list({
            types: 'public_channel,private_channel'
        });

        // Procesa y muestra los canales
        result.channels.forEach((channel) => {
            console.log(`Canal: ${channel.name} (ID: ${channel.id})`);
        });
    } catch (error) {
        console.error(error);
    }
}
async function listChannelsAndJoinIfNotMember() {
    try {
        // Llama a la API de Slack para obtener la lista de canales
        const result = await web.conversations.list({
            types: 'public_channel,private_channel'
        });

        // Procesa y muestra los canales
        for (const channel of result.channels) {
            console.log(`Canal: ${channel.name} (ID: ${channel.id})`);

            try {
                // Intenta obtener el historial del canal para verificar si el bot es miembro
                await web.conversations.history({
                    channel: channel.id,
                });
            } catch (error) {
                if (error.data.error === 'not_in_channel') {
                    console.log(`El bot no es miembro del canal: ${channel.name}, uniéndose...`);

                    // Unir al bot al canal
                    await web.conversations.join({
                        channel: channel.id,
                    });
                    console.log(`Bot unido al canal: ${channel.name}`);
                } else {
                    console.error(`Error al obtener historial del canal ${channel.name}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error al listar los canales:', error);
    }
}


module.exports = {
    AppSlack: app,
    WebSlack: web,
    fetchMessages,
    listChannels,
    listChannelsAndJoinIfNotMember,
}