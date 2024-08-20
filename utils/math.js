function truncate(amount, decimals) {
  const [integer, decimal] = amount.toString().split(".");

  if (!decimal) {
    return integer;
  }

  const truncatedDecimal = decimal.slice(0, decimals);

  if (truncatedDecimal === "0".repeat(truncatedDecimal.length)) {
    return integer;
  }

  const truncatedAmount = `${integer}.${truncatedDecimal}`;

  return truncatedAmount.replace(/0+$/, "");
}

module.exports = { truncate };
