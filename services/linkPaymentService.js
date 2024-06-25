// services/linkPaymentService.js
const AssetController = require('../controllers/assets.controller');
const LinkPayment = require('../models/LinkPayment');
const { limitDecimals } = require('../utils');

const getLinkPayments = async (filter = {}) => {
    return await LinkPayment.find(filter);
};

const getLinkPaymentById = async (query) => {
    return await LinkPayment.findOne(query).populate({ path: "user", select: "-apiKey -resetPasswordExpires -resetPasswordToken -__v -createdAt -updatedAt" }).populate("asset");
};

const getLinkPaymentByMerchantId = async (id) => {
    return await LinkPayment.find({ merchantId: Object(id) }).sort({ date: -1 });
};
const createLinkPayment = async (linkPaymentData, merchantId) => {
    // console.log(linkPaymentData)
    let paym = {};
    // console.log(linkPaymentData)+
    linkPaymentData.merchantId = merchantId;
    if (linkPaymentData.id != null) {
        paym = await LinkPayment.findOneAndUpdate({ id: linkPaymentData.id }, linkPaymentData);
    } else {
        const linkPayment = new LinkPayment({
            ...linkPaymentData,
            merchantId,
        });
        paym = await linkPayment.save();
    }

    if (paym.assetId != "" && paym.assetId) {
        let asset = await AssetController.findOne({ id: paym.assetId });
        if (asset?.decimals) {

            paym.quote_amount = limitDecimals(paym.quote_amount, asset.decimals)
            await paym.save();
        }
    }

    return paym;

};

const updateLinkPayment = async (id, userId, linkPaymentData) => {
    return await LinkPayment.findOneAndUpdate({ id: id, merchantId: userId }, linkPaymentData);
};
const deleteLinkPayment = async (id) => {
    return await LinkPayment.findByIdAndDelete(id);
};

const addWalletTriedPayment = async (paymentId, walletString = null, hash = null, statusHash = false) => {
    try {
        // Buscar el LinkPayment por id
        const linkPayment = await LinkPayment.findOne({ id: paymentId }).populate("asset");
        console.log(paymentId, walletString, hash)
        if (!linkPayment) {
            throw new Error('LinkPayment not found');
        }

        // Agregar el walletString al array walletsTriedPayment
        if (walletString != null) {
            linkPayment.walletsTriedPayment.push(walletString);
        }
        if (hash != null) {
            linkPayment.hash.push(hash)
            if (statusHash != false) {

                linkPayment.status = "paid";
            } else {

            }
        }

        // Guardar los cambios en la base de datos
        await linkPayment.save();

        return linkPayment;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
module.exports = {
    getLinkPayments,
    getLinkPaymentById,
    createLinkPayment,
    updateLinkPayment,
    deleteLinkPayment, getLinkPaymentByMerchantId, addWalletTriedPayment
};
