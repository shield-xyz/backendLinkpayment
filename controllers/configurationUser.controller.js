const ConfigurationUser = require('../models/configurationUser.model');
const ConfigurationController = require('./configuration.controller');

const ConfigurationUserController = {
    async createConfigurationUser(data) {
        try {
            const configurationUser = new ConfigurationUser(data);
            await configurationUser.save();
            return configurationUser;
        } catch (error) {
            return error.message;
        }
    },

    async getConfigurationUsers(filter = {}) {
        try {
            let configurationUsers = await ConfigurationUser.find(filter).populate('configuration');
            configurationUsers = configurationUsers.map(x => x.toObject());
            return configurationUsers;
        } catch (error) {
            return error.message;
        }
    },

    async getConfigurationUserById(id) {
        try {
            let configurationUser = await ConfigurationUser.findById(id).populate('configuration');
            configurationUser = configurationUser.toObject();
            return configurationUser;
        } catch (error) {
            return error.message;
        }
    },

    async updateConfigurationUser(id, data) {
        try {
            const configurationUser = await ConfigurationUser.findByIdAndUpdate(id, data, { new: true });
            return configurationUser;
        } catch (error) {
            return error.message;
        }
    },

    async deleteConfigurationUser(id) {
        try {
            const configurationUser = await ConfigurationUser.findByIdAndDelete(id);
            return configurationUser;
        } catch (error) {
            return error.message;
        }
    },
    async createDefault(userId) {
        let configurations = await ConfigurationController.getConfigurations();
        const configurationUser = (await this.getConfigurationUsers({ userId: userId })).map(x => x.configurationId);
        const networksToCreate = configurations.filter(conf => !configurationUser.includes(conf._id));
        await Promise.all(
            networksToCreate.map(async (conf) => {
                await this.createConfigurationUser({
                    userId: userId,
                    configurationId: conf._id,
                    value: conf.value,
                    json: conf.json,
                });
            })
        )
    }
};

module.exports = ConfigurationUserController;
