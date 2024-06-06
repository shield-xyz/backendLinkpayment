module.exports = {
    ...require('./balance.service.js'),
    ...require('./debit-cards.service.js'),
    ...require('./limits.service.js'),
    ...require('./transactions.service.js'),
    ...require('./txOrphaned.service.js'),
    ...require('./txReceipt.service.js'),
    ...require('./users-update.service.js'),
    ...require('./wallet.service.js'),
};
