const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const transporter = require('../utils/Email');
const { EMAIL_USER } = process.env;

const readHTMLFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, html) => {
            if (err) {
                reject(err);
            } else {
                resolve(html);
            }
        });
    });
};

const sendEmail = async (to, subject, replacements) => {
    try {
        const html = await readHTMLFile(path.join(__dirname, '../templates/emailTemplate.html'));
        const template = handlebars.compile(html);
        const htmlToSend = template(replacements);

        const mailOptions = {
            from: EMAIL_USER,
            to,
            subject,
            html: htmlToSend // Asegúrate de que el campo es `html` y no `text`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const EmailController = {
    async sendTransactionSuccessEmail(to, transactionDetails) {
        const subject = 'Transaction Successful';
        const body = `
          <h1>Transaction Successful</h1>
          <p>Your transaction of ${transactionDetails.amount} to ${transactionDetails.recipient} was successful. Transaction ID: ${transactionDetails.txId}.</p>
          <a href="${transactionDetails.transactionUrl}" class="button">View Transaction</a>
        `;

        const replacements = {
            title: 'Transaction Successful',
            body
        };

        await sendEmail(to, subject, replacements);
    },

    async sendPaymentReceivedEmail(to, transactionDetails) {
        const subject = 'Payment Received';
        const body = `
          <h1>Payment Received</h1>
          <p>You have received a payment of ${transactionDetails.amount} from ${transactionDetails.sender}. Transaction ID: ${transactionDetails.txId}.</p>
          <a href="${transactionDetails.transactionUrl}" class="button">View Transaction</a>
        `;

        const replacements = {
            title: 'Payment Received',
            body
        };

        await sendEmail(to, subject, replacements);
    },

    async sendPasswordResetEmail(to, resetUrl) {
        const subject = 'Password Reset Request';
        const body = `
          <h1>Password Reset Request</h1>
          <p>Hello,</p>
          <p>You are receiving this email because we received a password reset request for your account.</p>
          <p>Please click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>If you did not request a password reset, no further action is required.</p>
        `;

        const replacements = {
            title: 'Password Reset Request',
            body
        };

        await sendEmail(to, subject, replacements);
    }
};

module.exports = EmailController;
