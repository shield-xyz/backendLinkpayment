// routes/clientsRoutes.js
const express = require('express');
const router = express.Router();
const clientsAddressController = require('../controllers/clientsAddressController');
const { response } = require('../db');
const auth = require('../middleware/auth');
const apiKeyMaster = require('../middleware/apiKeyMaster');
const { getWhatsAppGroups } = require('../utils');
const ClientsAddressModel = require('../models/ClientsAddressModel');

async function loadExcel() {

    let json = {
        "Lucas (MF Ocean 12)": {
            "network": "Tron",
            "addresses": [
                "TAucN8UckSKagM2KE5PkVKZ4XBvSWUwive"
            ],
            "email":"lucasmeza75@hotmail.com"
        },
        "Eze Technologies": {
            "network": "Tron",
            "addresses": [
                "TYGoPRAZW3TDpYyWNnU3E6DKpvgeBqVhXC",
                "TVPjfJzRrkvoNgtV8Xvob8ZApEaEWbXC2h",
                "TLSNHNjVAJM4eDVS2CtJtBEysPmuKDdtyW",
                "TYTdFF1RuEvB5SwGdTZoawY4NMMchMExYB",
                "TXb3ShK1k9tSHBBiVyYz8yBzKo3jBpAt5q",
                "TJL7ikFJwi9UbmgenQovWNPXwk3CZmmohB",
                "TQzhQ3SqymgbhrP2sSgyLkSynLgEGqAjRi",
                "TH3FF58t7hExthCmNUn7VThT2vvsvmkN3m",
                "TQzhQ3SqymgbhrP2sSgyLkSynLgEGqAjRi",
                "TJDENsfBJs4RFETt1X1W8wMDc8M5XnJhCe",
                "TK8CNZcRZgpGPJA76z5mM2HorAxSjxpsWS",
                "TTqEDJTe9MgnQtXXsH9EHw9werLkRvSJuW",
                "TQd3dABHxFZRuwZwmeMH4rkKkvmNaG8YYk",
                "TVx7sgBwgMdMBpU8aM5GmhsHSfoKLDTYU2",
                "TBrAgWDVr9YfjgkpGiXpsxSAfWStwYT15S",
                "TMWh1ZusNcwdLeSNMxsWQbms6EcgyMkoKn",
                "TVkDL9vJ3cwAmu4WRctMe4JKGxHhaBWt3J"
            ],
            "email":"josh@ezewholesale.com"
        },
        "Arda Erturk": {
            "network": "Tron",
            "addresses": [
                "TW4n9jyNErxsTWxYXAF3Qmcae6Zaqgk6Un"
            ]
        },
        "Corey Mccauley": {
            "network": "Ethereum",
            "addresses": [
                "0xAe2D4617c862309A3d75A0fFB358c7a5009c673F"
            ]
        },
        "Gerald Kwazu": {
            "network": "Solana",
            "addresses": [
                "7zMygMkUGoDEp1sDWP5SRdXJMyFjCD7yzeANR8veo6uL"
            ]
        },
        "Yaniv Azar": {
            "network": "Ethereum",
            "addresses": [
                "0x996922c411AD2d4eC98B95fec7FbFcbD09c75686"
            ],
            "email":"azaryaniv@nreach.io"
        },
        "Edward Calderon": {
            "network": "Tron",
            "addresses": [
                "TQjJspYyu4s27FZ8BQw8Td3HWB3PRD9Bgs"
            ]
        }
    };

    Object.entries(json).map(async x => {
        await ClientsAddressModel.updateOne({ name: x[0], }, { $set: { name: x[0], wallets: x[1].addresses } }, { upsert: true });
        console.log(x);
    })
}
// loadExcel();
router.get('/', apiKeyMaster, async (req, res) => {
    try {
        const clients = await clientsAddressController.getClients();
        res.json(response(clients, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching clients', 'error'));
    }
});

router.get('/admin/', apiKeyMaster, async (req, res) => {
    try {
        const clients = await clientsAddressController.getClients();
        res.json(response(clients, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching clients', 'error'));
    }
});


router.post('/groupsWpp/', apiKeyMaster, async (req, res) => {
    try {
        const groups = await getWhatsAppGroups();
        res.json(response(groups, "success"));
    } catch (error) {
        res.status(500).json(response(error.message, 'error'));
    }
});

router.get('/wallet/:address', apiKeyMaster, async (req, res) => {
    try {
        const client = await clientsAddressController.getClientByWalletAddress(req.params.address);
        if (!client) return res.status(404).json(response('Client not found', 'error'));
        res.json(response(client, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching client by wallet address', 'error'));
    }
});

router.post('/', apiKeyMaster, async (req, res) => {
    try {
        const newClient = await clientsAddressController.createClient(req.body);
        res.json(response(newClient, "success"));
    } catch (error) {
        res.status(500).json(response('Error creating client', 'error'));
    }
});

router.put('/:id', apiKeyMaster, async (req, res) => {
    try {
        const updatedClient = await clientsAddressController.updateClient({ _id: req.params.id }, req.body);
        if (!updatedClient) return res.status(404).json(response('Client not found', 'error'));
        res.json(response(updatedClient, "success"));
    } catch (error) {
        res.status(500).json(response('Error updating client', 'error'));
    }
});

router.delete('/:id', apiKeyMaster, async (req, res) => {
    try {
        await clientsAddressController.deleteClient(req.params.id);
        res.json(response('Client deleted', "success"));
    } catch (error) {
        res.status(500).json(response('Error deleting client', 'error'));
    }
});

module.exports = router;
