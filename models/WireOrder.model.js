const { Schema, model } = require("mongoose");

const WireOrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "CREATED",
    },
    amountIn: {
      type: String,
      required: true,
    },
    assetIn: {
      type: String,
      required: true,
    },
    amountOut: {
      type: String,
      required: true,
    },
    assetOut: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    network: {
      type: Schema.Types.ObjectId,
      ref: "Network",
      required: true,
    },
    wallet: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("WireOrder", WireOrderSchema);
