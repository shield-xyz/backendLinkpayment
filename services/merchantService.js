// services/merchantService.js
const Merchant = require('../models/Merchant');

const getMerchants = async () => {
    return await Merchant.find();
};

const getMerchantById = async (id) => {
    return await Merchant.findById(id);
};

const createMerchant = async (merchantData) => {
    const merchant = new Merchant(merchantData);
    return await merchant.save();
};

const updateMerchant = async (id, merchantData) => {
    return await Merchant.findByIdAndUpdate(id, merchantData, { new: true });
};

const deleteMerchant = async (id) => {
    return await Merchant.findByIdAndDelete(id);
};

module.exports = {
    getMerchants,
    getMerchantById,
    createMerchant,
    updateMerchant,
    deleteMerchant,
};
