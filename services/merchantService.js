// services/merchantService.js
const Merchant = require('../models/Merchant');
const UserModel = require('../models/user.model');


const getMerchants = async () => {
    return await UserModel.find();
};

const getMerchantById = async (id) => {
    return await UserModel.findById(id);
};

const createMerchant = async (merchantData) => {
    const merchant = new UserModel(merchantData);
    return await merchant.save();
};

const updateMerchant = async (id, merchantData) => {
    return await UserModel.findByIdAndUpdate(id, merchantData, { new: true });
};

const deleteMerchant = async (id) => {
    return await UserModel.findByIdAndDelete(id);
};

module.exports = {
    getMerchants,
    getMerchantById,
    createMerchant,
    updateMerchant,
    deleteMerchant,
};
