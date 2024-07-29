const Asset = require('../models/asset.model');

const AssetController = {
    async createAsset(data) {
        try {
            const asset = new Asset(data);
            await asset.save();
            return asset;
        } catch (error) {
            console.log(error, "error al crear asset ")
        }
    },

    async getAssets(filter = {}) {
        const assets = await Asset.find(filter);
        return assets;
    },
    async findOne(filter) {
        const asset = await Asset.findOne(filter);
        return asset;
    },
    async updateAsset(id, data) {

        if (id == null) {
            return this.createAsset(data);
        }
        const asset = await Asset.findOneAndUpdate({ assetId: id }, data, { new: true, upsert: true });
        return asset;
    },

    async deleteAsset(id) {
        const asset = await Asset.findOneAndDelete({ assetId: id });
        return asset;
    },

    async createDefault() {
        let data = [
            {
                "assetId": "usdt-ethereum",
                "symbol": "USDT",
                "name": "Tether USD",
                "decimals": 6,
                "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/21763.png",
                "active": true,
                "networkId": "ethereum",
                "address": process.env.USDT_ADDRESS_ETHEREUM
            },
            {
                "assetId": "usdc-ethereum",
                "symbol": "USDC",
                "name": "USD Coin",
                "decimals": 6,
                "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
                "active": true,
                "networkId": "ethereum",
                "address": process.env.USDC_ADDRESS_ETHEREUM
            },
            {
                "assetId": "usdt-tron",
                "symbol": "USDT",
                "name": "Tether USD",
                "decimals": 6,
                "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/21763.png",
                "active": true,
                "networkId": "tron",
                "address": process.env.USDT_TRON_ADDRESS
            },

            {
                "assetId": "btc-bitcoin",
                "symbol": "BTC",
                "name": "Bitcoin",
                "decimals": 8,
                "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
                "active": true,
                "networkId": "bitcoin",
                "address": "null"
            },
            {
                "assetId": "dai-ethereum",
                "symbol": "DAI",
                "name": "Dai",
                "decimals": 18,
                "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png",
                "active": false,
                "networkId": "ethereum",
                "address": null
            },


        ];

        const networks = await this.getAssets();
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            let exist = networks.find(x => x.assetId == element.assetId);
            // console.log(exist, "exist", element)
            if (exist) {
                await this.updateAsset(element.assetId, element);
            } else {
                await this.createAsset(element);
            }
        }
    }
};

module.exports = AssetController;
