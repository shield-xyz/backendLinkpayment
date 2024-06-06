
function buildSyncResponse(savedTransactions, notSyncedTransactions) {
  const totalUSD = savedTransactions.reduce((acc, t) => {
    return acc + t.crypto_deductions.reduce((acc, cd) => acc + cd.usdValue, 0);
  }, 0);

  const totalRampUSD = notSyncedTransactions.reduce(
    (acc, t) => acc + t.amount,
    0
  );

  return {
    numberOfTransactions: savedTransactions.length,
    transactionsTotalUSD: totalUSD,
    rampTotalUSD: totalRampUSD,
  };
}

module.exports = { buildSyncResponse };
