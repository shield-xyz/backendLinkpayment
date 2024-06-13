const Network = require('../models/networks.model');

const NetworkController = {
    async createNetwork(data) {
        try {

            const network = new Network(data);
            await network.save();
            return network;
        } catch (error) {
            return error.message;
        }
    },

    async getNetworks(filter = {}) {
        const networks = await Network.find(filter);
        return networks;
    },

    async updateNetwork(id, data) {

        const network = await Network.findOneAndUpdate({ networkId: id }, data, { upsert: true });
        return network;
    },

    async deleteNetwork(id) {
        const network = await Network.findByIdAndDelete(id);
        return network;
    },

    async createDefault() {

        let data =
            [
                {
                    "networkId": "ethereum",
                    "name": "Ethereum",
                    "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
                    "deposit_address": "",

                },
                {
                    "networkId": "tron",
                    "name": "Tron",
                    "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png",
                    "deposit_address": process.env.WALLET_TRON_DEPOSIT,

                },
                {
                    "networkId": "bitcoin",
                    "name": "Bitcoin",
                    "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                    "deposit_address": "",

                }
            ];

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            const networks = await this.getNetworks();
            let exist = networks.find(x => x.networkId == element.networkId);
            if (exist != undefined)
                await this.updateNetwork(element.networkId, element);
            else
                await this.createNetwork(element);
        }
    }
};

module.exports = NetworkController;