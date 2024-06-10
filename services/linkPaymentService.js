// services/linkPaymentService.js
const LinkPayment = require('../models/LinkPayment');

const getLinkPayments = async () => {
    return await LinkPayment.find();
};

const getLinkPaymentById = async (query) => {
    return await LinkPayment.findOne(query);
};

const getLinkPaymentByMerchantId = async (id) => {
    return await LinkPayment.find({ merchantId: Object(id) }).sort({ date: -1 });
};
const createLinkPayment = async (linkPaymentData, merchantId) => {
    // console.log(linkPaymentData)
    if (linkPaymentData.id != null) {
        return await LinkPayment.findOneAndUpdate({ id: linkPaymentData.id }, linkPaymentData);
    } else {
        const linkPayment = new LinkPayment({
            ...linkPaymentData,
            merchantId,
        });
        return await linkPayment.save();
    }
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
        const linkPayment = await LinkPayment.findOne({ id: paymentId });
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
