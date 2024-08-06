const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const transporter = require("../utils/Email");
const { EMAIL_USER } = process.env;

const readHTMLFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: "utf-8" }, (err, html) => {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
};

const sendEmail = async (
  to,
  subject,
  replacements,
  fileName = "emailTemplate.html"
) => {
  try {
    const html = await readHTMLFile(
      path.join(__dirname, "../templates/" + fileName)
    );
    const template = handlebars.compile(html);
    replacements = {
      ...replacements,
      EMAIL_CONTACT_US: process.env.EMAIL_CONTACT_US,
      PHONE_CONTACT_US: process.env.PHONE_CONTACT_US,
      FACEBOOK_LINK: process.env.FACEBOOK_LINK,
      INSTAGRAM_LINK: process.env.INSTAGRAM_LINK,
      TWITTER_LINK: process.env.TWITTER_LINK,
      PRIVACY_LINK: process.env.PRIVACY_LINK,
      TERMS_LINK: process.env.TERMS_LINK,
    };
    const htmlToSend = template(replacements);

    const mailOptions = {
      from: EMAIL_USER,
      name: process.env.EMAIL_NAME,
      to,
      subject,
      html: htmlToSend, // Asegúrate de que el campo es `html` y no `text`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendEmailNotCatch = async (
  to,
  subject,
  replacements,
  fileName = "emailTemplate.html"
) => {
  const html = await readHTMLFile(
    path.join(__dirname, "../templates/" + fileName)
  );
  const template = handlebars.compile(html);
  replacements = {
    ...replacements,
    EMAIL_CONTACT_US: process.env.EMAIL_CONTACT_US,
    PHONE_CONTACT_US: process.env.PHONE_CONTACT_US,
    FACEBOOK_LINK: process.env.FACEBOOK_LINK,
    INSTAGRAM_LINK: process.env.INSTAGRAM_LINK,
    TWITTER_LINK: process.env.TWITTER_LINK,
    PRIVACY_LINK: process.env.PRIVACY_LINK,
    TERMS_LINK: process.env.TERMS_LINK,
  };
  const htmlToSend = template(replacements);

  const mailOptions = {
    from: EMAIL_USER,
    name: process.env.EMAIL_NAME,
    to,
    subject,
    html: htmlToSend, // Asegúrate de que el campo es `html` y no `text`
  };

  await transporter.sendMail(mailOptions);
};

const EmailController = {
  async sendTransactionSuccessEmail(
    to,
    urlHash,
    amount,
    token,
    networkId,
    linkPaymentId,
    idTransaction
  ) {
    const subject = "Transaction Successful";
    // const body = `
    //   <h1>Transaction Successful</h1>
    //   <p>Your transaction of ${amount} ${token} - ${networkId} for <a href="${process.env.URL_FRONT}/paylink?id=${linkPaymentId}" target="_blank" >Link Payment</a>. Transaction ID: ${idTransaction}.</p>
    //   <a href="${urlHash}" target="_blank" class="button">View Transaction Blockchain</a>
    // `;

    const replacements = {
      title: "Transaction Successful",
      amount,
      token,
      urlHash,
      networkId,
      idTransaction,
      linkPayment: `${process.env.URL_FRONT}/paylink?id=${linkPaymentId}`,
    };

    await sendEmail(to, subject, replacements, "TransactionReceived.html");
  },
  async sendTokenReceivedManual(to, amount) {
    const subject = "Successfully received tokens";
    const replacements = {
      title: "Successfully received tokens",
      amount,
    };

    await sendEmailNotCatch(
      to,
      subject,
      replacements,
      "manual/tokenReceived.html"
    );
  },
  async sendTransferInitiatedManual(to, amount) {
    const subject = "Wire Transfer Initiated";
    const replacements = {
      title: "Wire Transfer Initiated",
      amount,
      date: new Date(),
    };

    await sendEmailNotCatch(
      to,
      subject,
      replacements,
      "manual/TransferInitiated.html"
    );
  },
  async sendPaymentReceivedPaymentEmail(
    to,
    urlHash,
    amount,
    token,
    networkId,
    idTransaction
  ) {
    const subject = "Payment Received";
    // const body = `
    //   <h1>Payment Received</h1>
    //   <p>You have received a payment of ${amount} ${token} - ${networkId}. Transaction ID: ${idTransaction}.</p>
    //   <a href="${urlHash}" target="_blank" class="button">View Transaction Blockchain</a>
    // `;

    const replacements = {
      title: "Payment Received",
      amount,
      token,
      urlHash,
      networkId,
      idTransaction,
    };

    await sendEmail(to, subject, replacements, "PaymentReceived.html");
  },
  async sendProcessingWithdraw(to, amount, asset, withdraw) {
    const subject = "Withdraw in Progress";
    // const body = `
    //   <h1>Payment Received</h1>
    //   <p>You have received a payment of ${amount} ${token} - ${networkId}. Transaction ID: ${idTransaction}.</p>
    //   <a href="${urlHash}" target="_blank" class="button">View Transaction Blockchain</a>
    // `;

    const replacements = {
      title: "Withdraw in Progress",
      amount,
      symbol: asset.symbol,
      withdrawId: withdraw._id,
      date: withdraw.date,
    };

    await sendEmail(to, subject, replacements, "WithdrawCreated.html");
  },
  async sendPaymentReceivedEmail(to, transactionDetails) {
    const subject = "Payment Received";
    const body = `
          <h1>Payment Received</h1>
          <p>You have received a payment of ${transactionDetails.amount} from ${transactionDetails.sender}. Transaction ID: ${transactionDetails.txId}.</p>
          <a href="${transactionDetails.transactionUrl}" class="button">View Transaction</a>
        `;

    const replacements = {
      title: "Payment Received",
      body,
    };

    await sendEmail(to, subject, replacements, "PaymentReceived.html");
  },
  async sendGeneralEmail(to, title, message, components = []) {
    const replacements = {
      title,
      message,
      components,
    };

    await sendEmail(to, title, replacements, "EmailGeneral.html");
  },

  async sendPasswordResetEmail(to, resetUrl) {
    const subject = "Password Reset Request";

    const replacements = {
      title: "Password Reset Request",
      resetUrl: resetUrl,
    };

    await sendEmail(to, subject, replacements, "PasswordResets.html");
  },

  async sendRampConfirmationEmail(to, transaction) {
    const subject = "Ramp Request Confirmation";

    const replacements = {
      title:
        transaction.type === "sell"
          ? "Off-Ramp Confirmation"
          : "On-Ramp Confirmation",
      type: transaction.type === "sell" ? "off-ramp" : "on-ramp",
    };

    await sendEmail(to, subject, replacements, "RampReceived.html");
  },
};

module.exports = EmailController;
