// scripts/imporTransactions.js
const AssetController = require("../controllers/assets.controller");
const NetworksController = require("../controllers/network.controller");
const WalletNetworkUserController = require("../controllers/walletNetworkUser.controller");
const ConfigurationsController = require("../controllers/configuration.controller")
const { connectDB } = require("../db");
const userModel = require("../models/user.model");
const logger = require('node-color-log');
const ConfigurationUserController = require("../controllers/configurationUser.controller");
// const walletNetworkUserController = require('../controllers/walletNetworkUser.controller');

const runScript = async () => {
    console.log("starting script");
    await connectDB();
    let users = await userModel.find({});
    logger.fontColorLog("green", "creating  configurations");
    await ConfigurationsController.createDefault();
    logger.fontColorLog("green", "creating configurations finish");

    logger.fontColorLog("green", "creating configurations from users " + users.length);
    logger.fontColorLog("green", "creating networks from users " + users.length);
    await Promise.all(users.map(async (user) => {
        await ConfigurationUserController.createDefault(user._id);
        await WalletNetworkUserController.ensureWalletNetworkUsersForUser(user._id);

    }));


    logger.fontColorLog("green", "creating/updating networks");
    await NetworksController.createDefault();
    logger.fontColorLog("green", "creating/updating networks finish");

    logger.fontColorLog("green", "creating/updating assets");
    await AssetController.createDefault();
    logger.fontColorLog("green", "creating/updating asets finish");




};

runScript().then(() => {
    console.log("Script completed");
    process.exit(0);
}).catch(error => {
    console.error("Error running script:", error);
    process.exit(1);

});
