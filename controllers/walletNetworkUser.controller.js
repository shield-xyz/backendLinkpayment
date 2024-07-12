const WalletNetworkUser = require('../models/walletNetworkUser.model')
const Network = require('../models/networks.model'); // Asumiendo que tienes un modelo de Network
const User = require('../models/user.model'); // Asumiendo que tienes un modelo de User

const WalletNetworkUserController = {
    async createWalletNetworkUser(data) {
        try {
            const walletNetworkUser = new WalletNetworkUser(data);
            await walletNetworkUser.save();
            return walletNetworkUser;
        } catch (error) {
            return error.message;
        }
    },

    async getWalletNetworkUsers(filter = {}) {
        try {
            const walletNetworkUsers = await WalletNetworkUser.find(filter);
            return walletNetworkUsers;
        } catch (error) {
            return error.message;
        }
    },

    async getWalletNetworkUserById(id) {
        try {
            const walletNetworkUser = await WalletNetworkUser.findById(id);
            return walletNetworkUser;
        } catch (error) {
            return error.message;
        }
    },

    async updateWalletNetworkUser(id, data) {
        try {
            const walletNetworkUser = await WalletNetworkUser.findByIdAndUpdate(id, data, { new: true });
            return walletNetworkUser;
        } catch (error) {
            return error.message;
        }
    },

    async deleteWalletNetworkUser(id) {
        try {
            const walletNetworkUser = await WalletNetworkUser.findByIdAndDelete(id);
            return walletNetworkUser;
        } catch (error) {
            return error.message;
        }
    },

    async ensureWalletNetworkUsersForUser(userId) {
        try {
            const networks = await Network.find({ deposit_address: { $nin: [null, ""] } }); // Asumiendo que tienes un modelo de Network
            const existingWallets = await WalletNetworkUser.find({ userId });

            const networkIdsWithWallets = existingWallets.map(wallet => wallet.networkId);
            const networksToCreate = networks.filter(network => !networkIdsWithWallets.includes(network.networkId));

            const newWallets = [];

            for (const network of networksToCreate) {
                const newWallet = new WalletNetworkUser({
                    userId,
                    networkId: network.networkId,
                    address: network.deposit_address,
                });
                await newWallet.save();
                newWallets.push(newWallet);
            }

            return newWallets;
        } catch (error) {
            return error.message;
        }
    }
};

module.exports = WalletNetworkUserController;
