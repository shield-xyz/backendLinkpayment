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
        let networks = await Network.find(filter).populate("assets");
        networks = networks.map(network => network.toObject({ virtuals: true })).filter(x => (x.assets.length > 0))
        return networks;
    },

    async updateNetwork(id, data) {

        const network = await Network.findOneAndUpdate({ networkId: id }, data, { upsert: true });
        return network;
    },
    async findOne(filter) {
        const network = await Network.findOne(filter);
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
                    "deposit_address": "0xAb816fD46dEf5518dd615d863463A2226ef1745A", // TODO change wallet to prod
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

            const networks = await this.getNetworks();
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let exist = networks.find(x => x.networkId == element.networkId);
            if (exist != undefined)
                await this.updateNetwork(element.networkId, element);
            else
                await this.createNetwork(element);
        }
    }
};

module.exports = NetworkController;
