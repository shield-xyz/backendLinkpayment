// scripts/imporTransactions.js
const TransactionController = require("../controllers/transactions.controller");
const { connectDB } = require("../db");
const balanceModel = require("../models/balance.model");
const transactionModel = require("../models/transaction.model");

const runScript = async () => {
    console.log("starting script");
    await connectDB();

    let data = [
        {
            "name": "Eze Technologies",
            "amount": "$5,000.00",
            "tx": "0c82ad9c2399b63df650cca2e092bf4c297f4f97661f32529ce2e1acdc223307",
            "date": "12/11/2023",
        },
        {
            "name": "Eze Technologies",
            "amount": "$5,000.00",
            "tx": "589924b1308862a758091e349f4ebd822fcb229d418b3845ab73aca12b6996d8",
            "date": "12/15/2023",
        },
        {
            "name": "Eze Technologies",
            "amount": "$16,500.00",
            "tx": "0d5727f330641110a3d722466e98ff23302e598e0c307803189d944be544c406",
            "date": "12/20/2023",
        },
        {
            "name": "Eze Technologies",
            "amount": "$5,000.00",
            "tx": "bfa2fec296b6127341d9e10fd7502456622f48b453c81b453a4c9110d52212f6",
            "date": "1/6/2024",
        },
        {
            "name": "Eze Technologies",
            "amount": "$12,000.00",
            "tx": "cc82dba496ec5d92b937f28ce85a3ac685988373288a7c073d5341f4cf0aae59",
            "date": "1/10/2024",
        },
        {
            "name": "Eze Technologies",
            "amount": "$5,000.00",
            "tx": "285cbd1e38bdee9e2fb28fc601f3692d3fe2def0bd454eb1113431818b648af5",
            "date": "1/18/2024",
        },
        {
            "name": "Eze Technologies",
            "amount": "$65,000.00",
            "tx": "096ca6ffb4c32df7a6039a7d2e7dab1608d65618e897ea36593e3f2270a5aaa6",
            "date": "1/18/2024",
        },
        {
            "name": "Eze Technologies",
            "amount": "$6,980.00",
            "tx": "aa69a792b5a5655d7fb40f8a4af915d4fa5754617b81fcd6794badf86a94c2b8",
            "date": "1/24/2024",
        },
        {
            "name": "Eze Technologies",
            "amount": "$15,800.00",
            "tx": "a2a0b926746ef2aed3e887ebfd7e727d04a544ee5bd27c4bde5c7b5774510274",
            "date": "1/24/2024",
        },
        {
            "name": "Eze Technologies",
            "amount": "$8,000.00",
            "tx": "7e8dfb198522011ef7dbd1760b7d88463dabd7ce695e777ab3b219e03e2c9b35",
            "date": "1/24/2024",
        }
    ];
    let userId = "66826162a20b6bf35358ea0d";
    if (process.env.DB_NAME_MONGO == "development-test") {
        // userId = "667477f6769e23782b7c2984"
        // await transactionModel.deleteMany({ userId });
    }

    let assetId = "usdt-tron";
    let networkId = "tron";
    for (let i = 0; i < data.length; i++) {
        let da = data[i];
        console.log("Processing data:", da);
        try {
            const amount = parseFloat(da["amount"].replace(/[\$,]/g, ''));
            let result;
            da.amount = amount;
            let exist = await transactionModel.findOne({ hash: da.tx, assetId });

            if (!exist) {
                result = await TransactionController.createTransaction({
                    assetId: assetId,
                    networkId: networkId,
                    linkPaymentId: null,
                    amount: amount,
                    hash: da["tx"],
                    date: new Date(da["date"]), // Convertir fecha a objeto Date
                    userId: userId
                });
                // console.log("Transaction created:", result);
                //sumar amount a balance
                let balance = await balanceModel.findOne({ userId: userId, assetId: assetId })
                if (!balance) {
                    balance = new balanceModel({
                        amount: 0,
                        networkId: networkId,
                        assetId: assetId,
                        userId: userId,
                    })
                }
                balance.amount += amount;
                await balance.save();
                console.log(balance)


            }
        } catch (error) {
            console.error("Error creating transaction:", error);
        }
    }
};

runScript().then(() => {
    console.log("Script completed");
}).catch(error => {
    console.error("Error running script:", error);
});
