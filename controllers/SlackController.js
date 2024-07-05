const { WebClient } = require('@slack/web-api');
const { App } = require('@slack/bolt');
const BalanceController = require("../controllers/balance.controller.js");
const UserController = require("../controllers/user.controller.js");
const balanceModel = require('../models/balance.model.js');
const userModel = require('../models/user.model.js');
const WithdrawController = require('../controllers/withdraw.controller.js');
const accountModel = require('../models/account.model.js');
const { NOTIFICATIONS, CONFIGURATIONS } = require('../config/index.js');
const NotificationsController = require('../controllers/NotificationsUser.controller.js');
const ConfigurationUserController = require('./configurationUser.controller.js');
const { sendProcessingWithdraw } = require('./email.controller.js');

const channelId = process.env.SLACK_CHANNEL;
const web = new WebClient(process.env.SLACK_TOKEN);
const app = new App({
    token: process.env.SLACK_TOKEN, // Reemplaza con tu token
    signingSecret: process.env.SLACK_CODE, // Reemplaza con tu signing secret
    channel: channelId,
});

// Escucha todos los mensajes en los canales
app.event("message", async ({ message, say }) => {
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
            let comand = "usuario -codigo- withdraw 1000 usdt"
        });
    } catch (error) {
        console.error(error);
    }
}

async function sendBlock(block, channelId = process.env.SLACK_CHANNEL) {
    try {
        // Utiliza el WebClient para enviar un mensaje al canal
        const result = await web.chat.postMessage({
            channel: channelId,
            blocks: block
        });

        console.log('Mensaje enviado: ', result.ts);
    } catch (error) {
        {
            console.error('Error al enviar mensaje:', error);
        }
    }
}
async function sendMessage(messageText, channelId = process.env.SLACK_CHANNEL) {
    try {
        // Utiliza el WebClient para enviar un mensaje al canal
        const result = await web.chat.postMessage({
            channel: channelId,
            text: messageText
        });

        console.log('Mensaje enviado: ', result.ts);
    } catch (error) {
        {
            console.error('Error al enviar mensaje:', error);
        }
    }
}

async function listBalances() {
    let mes = "";
    let users = await balanceModel.aggregate([
        {
            $match: {
                amount: { $gt: 0 }
            }
        },
        {
            $group: {
                _id: '$userId',
                totalCount: { $sum: 1 }
            }
        },
    ]);
    console.log(users);
    for (let i = 0; i < users.length; i++) {
        const userId = users[i];

        let user = await userModel.findById(userId._id);
        let balances = await balanceModel.find({ userId: userId._id, amount: { $gt: 0 } }).populate("user asset network");
        if (balances.length > 0 && user) {

            // console.log(user, userId._id)
            mes += "User : " + user.user_name + "\n";

            balances.map(async balance => {
                const totalBalancesWithdraws = await withdrawsModel.find({ assetId: balance.assetId, userId: balance.userId });
                let balanceWithDraws = totalBalancesWithdraws.map(x => {
                    if (x?.amount) {
                        balanceWithDraws += amount;
                    }
                });

                mes += "id : " + balance._id + " :" + (balance.amount - balanceWithDraws) + " " + balance.asset.symbol + " - network : " + balance.network.name + "\n";
            })
        }
    }
    mes += "To create a withdraw type: withdraw|id|amount"
    console.log(mes)
    await sendMessage(mes);
}
function padRightTo(text, quantity = 30) {
    const desiredLength = quantity;
    if (text.length >= desiredLength) {
        return text;  // Si el texto ya es de 26 o más caracteres, lo devuelve tal cual
    }
    return text + '-'.repeat(desiredLength - text.length);  // Agrega espacios hasta alcanzar los 26 caracteres
}
async function generateWithDraw(amount, balanceId) {
    let balance = await balanceModel.findById(balanceId).populate("asset network user");

    console.log(balance, balance.asset, balance.network)
    if (!balance) {
        await sendMessage("balance not found");
        return

    }
    const totalBalancesWithdraws = await withdrawsModel.find({ assetId: balance.assetId, userId: balance.userId });
    let balanceWithDraws = totalBalancesWithdraws.map(x => {
        if (x?.amount) {
            balanceWithDraws += amount;
        }
    });

    if (amount + balanceWithDraws > balance.amount) {
        await sendMessage("the amount exceeds the balance, balance: " + balance.amount);
        return

    }
    let account = await accountModel.findOne({ userId: balance.userId, selected: true });
    if (!account) {
        // await sendMessage("the user not have account");
        // return
    }
    let wt = await WithdrawController.createWithdraw({
        amount: amount,
        assetId: balance.assetId,
        accountId: account?._id,
        userId: balance.userId,
        status: "pending",
        balanceId: balance._id
    });
    await NotificationsController.createNotification({
        ...NOTIFICATIONS.NEW_WITHDRAW(amount, wt._id),
        userId: balance.userId
    });
    let userConf = await ConfigurationUserController.userConfigForUserAndConfigName(balance.userId, CONFIGURATIONS.EMAIL_NAME);
    if (userConf.length > 0 && userConf[0]?.value == "true") {
        await sendProcessingWithdraw(balance.user.email, amount, balance.asset, wt);
    }


    balance.save();
    await sendMessage("Withdraw created, id : " + wt._id);
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

async function changeStatusWithdraw(withdrawId, status) {
    // let balance = await balanceModel.findById(balanceId).populate("asset network user");

    let withdraw = await WithdrawController.getWithdrawById(withdrawId);
    withdraw.status = status;
    await withdraw.save();

    await NotificationsController.createNotification({
        ...NOTIFICATIONS.STATUS_WITHDRAW(withdrawId, status),
        userId: withdraw.userId
    });
    // let userConf = await ConfigurationUserController.userConfigForUserAndConfigName(balance.userId, CONFIGURATIONS.EMAIL_NAME);

    await sendMessage("Withdraw status changed , id : " + withdrawId);
}


async function listWithDraws() {
    let wts = await WithdrawController.getWithdraws();
    let block = [];
    block.push({ type: "header", text: { type: "plain_text", text: "WithDraws List" } }); //header
    let section = {
        "type": "section",
    };
    fields = [
        {
            "type": "mrkdwn",
            "text": "*" + padRightTo("ID", 24) + " | User name * "
        },
        {
            "type": "mrkdwn",
            "text": "*" + padRightTo("Amount", 15) + "| Status *"
        },
    ];

    wts.map(withdraw => {
        console.log(withdraw.user)
        fields.push({
            "type": "mrkdwn",
            "text": "*" + padRightTo(withdraw._id + "", 24) + "* | " + withdraw.user.user_name
        })
        fields.push({
            "type": "mrkdwn",
            "text": "*" + padRightTo(withdraw.amount + " " + withdraw.asset.symbol, 15) + "* | " + withdraw.status
        })
    })
    section.fields = fields;
    console.log(section)
    await sendBlock([section]);

}

module.exports = {
    AppSlack: app,
    WebSlack: web,
    fetchMessages,
    listChannels,
    listChannelsAndJoinIfNotMember, sendMessage, listBalances, generateWithDraw, padRightTo, listWithDraws, changeStatusWithdraw
}