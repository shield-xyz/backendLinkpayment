const ClientsAddress = require('../models/ClientsAddressModel');

const ClientsAddressController = {
    async createClient(data) {
        const client = new ClientsAddress(data);
        await client.save();
        return client;
    },

    async getClients() {
        const clients = await ClientsAddress.find();
        return clients;
    },

    async getClientById(id) {
        const client = await ClientsAddress.findById(id);
        return client;
    },

    async updateClient(filter, data) {
        const client = await ClientsAddress.findOneAndUpdate(filter, data, { new: true, runValidators: true });
        return client;
    },

    async deleteClient(filter) {
        const client = await ClientsAddress.findByIdAndDelete(filter);
        return client;
    },

    async getClientByWalletAddress(walletAddress) {
        const client = await ClientsAddress.findOne({ wallets: { $regex: new RegExp(walletAddress, 'i') } });
        return client;
    }
};

module.exports = ClientsAddressController;
