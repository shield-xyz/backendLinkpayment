const Configuration = require('../models/configuration.model');

const ConfigurationController = {
    async createConfiguration(data) {
        try {
            const configuration = new Configuration(data);
            await configuration.save();
            return configuration;
        } catch (error) {
            console.log(error)
            return error.message;
        }
    },

    async getConfigurations(filter = {}) {
        try {
            const configurations = await Configuration.find(filter);
            return configurations;
        } catch (error) {
            return error.message;
        }
    },

    async getConfigurationById(id) {
        try {
            const configuration = await Configuration.findById(id);
            return configuration;
        } catch (error) {
            return error.message;
        }
    },

    async updateConfiguration(id, data) {
        try {
            const configuration = await Configuration.findByIdAndUpdate(id, data, { new: true });
            return configuration;
        } catch (error) {
            return error.message;
        }
    },

    async deleteConfiguration(id) {
        try {
            const configuration = await Configuration.findByIdAndDelete(id);
            return configuration;
        } catch (error) {
            return error.message;
        }
    },

    async createDefault() {

        let data =
            [
                {
                    name: "theme",
                    description: "",
                    json: {},
                    value: "white",
                    options: [
                        { name: "normal mode", value: "white" }, { name: "dark mode", value: "black" }
                    ]
                },
                {
                    name: "email notifications",
                    description: "If you want to receive payment notifications by email",
                    json: {},
                    value: true,
                    options: [
                        { name: "yes", value: true }, { name: "no", value: false }
                    ]
                },

            ];
        let exists = await this.getConfigurations();
        for (let i = 0; i < data.length; i++) {
            let exist = exists.find(x => x.name == data[i].name);
            console.log(data[i].name, exist)

            if (exist == undefined)
                await this.createConfiguration(data[i])
        }
    }
};

module.exports = ConfigurationController;
