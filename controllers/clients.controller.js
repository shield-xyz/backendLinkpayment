const Client = require('../models/clients.model');

const ClientsController = {
    async createClient(data) {
        const client = new Client(data);
        await client.save();
        return client;
    },

    async getClients() {
        const clients = await Client.find();
        return clients;
    },

    async getClientById(id) {
        const client = await Client.findById(id);
        return client;
    },

    async updateClient(id, data) {
        const client = await Client.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        return client;
    },

    async deleteClient(id) {
        const client = await Client.findByIdAndDelete(id);
        return client;
    },

    async generateApiKey(id) {
        const client = await Client.findById(id);
        if (!client) {
            throw new Error('Client not found');
        }
        client.apiKey = crypto.randomBytes(16).toString('hex');
        await client.save();
        return client.apiKey;
    }
};

module.exports = ClientsController;
