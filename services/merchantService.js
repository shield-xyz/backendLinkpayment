// services/merchantService.js
const Merchant = require('../models/Merchant');
const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');


const getMerchants = async () => {
    return await UserModel.find();
};

const getMerchantById = async (id, selects = "") => {
    if (selects != "") {
        return await UserModel.findById(id).select(selects);

    }
    return await UserModel.findById(id);
};

const createMerchant = async (merchantData) => {
    const merchant = new UserModel(merchantData);
    return await merchant.save();
};

const updateMerchant = async (id, merchantData, req) => {
    const filename = req?.file?.filename;
    // console.log(req)
    let up = {
        user_name: merchantData.user_name,
        logo: (filename) ? "uploads/" + filename : merchantData.logo,
        company: merchantData.company,
    };
    console.log(merchantData);
    if (merchantData.password) {
        const salt = bcrypt.genSaltSync(10);

        const hashed_password = bcrypt.hashSync(merchantData.password, salt);
        up["password"] = hashed_password;
    }

    return await UserModel.findByIdAndUpdate(id, up, { new: true });
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
