// getTransactionTron.js
const getTransactionTron = async (hash) => {
    try {
        const { default: fetch } = await import('node-fetch');
        const { default: TronWeb } = await import('tronweb');

        const tronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io'
        });

        // Simulación de búsqueda en la base de datos
        // let tx = await TransactionLogController.findOne({ hash: hash, network: "tron" });

        // Si se encuentra en la base de datos, la devuelve
        // if (tx != undefined && tx != null) {
        //   return tx;
        // }

        // Consulta la API de TronGrid para obtener la información de la transacción
        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ value: hash })
        };

        let response = await fetch('https://api.trongrid.io/wallet/gettransactioninfobyid', options);
        let data = await response.json();
        data.hash = hash;
        data.network = "tron";
        console.log(data);

        // Verifica si hay logs en el recibo de la transacción
        if (data.log) {
            const tokenTransfers = data.log.map(log => {
                // Verifica que el log contenga los topics esperados para una transferencia de tokens
                if (log.topics && log.topics.length >= 3) {
                    const tokenAddress = tronWeb.address.fromHex(log.address);
                    const fromAddress = tronWeb.address.fromHex('41' + log.topics[1].slice(26));
                    const toAddress = tronWeb.address.fromHex('41' + log.topics[2].slice(26));

                    return {
                        tokenAddress: tokenAddress, // Dirección del contrato del token en formato Tron
                        amount: parseInt(log.data, 16) / 1e6, // Convertir la cantidad de tokens de hexadecimal a decimal y ajustar por decimales de TRC20
                        from: fromAddress, // Extraer la dirección de origen desde el log y convertir a formato Tron
                        to: toAddress // Extraer la dirección de destino desde el log y convertir a formato Tron
                    };
                } else {
                    return null;
                }
            }).filter(log => log !== null); // Filtra los logs nulos

            console.log(tokenTransfers);
            data.tokenTransfers = tokenTransfers;
        } else {
            console.log('No token transfer logs found.');
        }

        // Guarda la transacción en la base de datos
        // await TransactionLogController.createTransaction(data);

        return data;

    } catch (error) {
        console.error('Error fetching transaction status:', error);
        return "error not found";
    }
};

module.exports = getTransactionTron;
