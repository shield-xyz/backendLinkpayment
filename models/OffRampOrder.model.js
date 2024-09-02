const { Schema, model } = require("mongoose");

const OffRampOderSchema = new Schema(
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
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    amountOut: {
      type: String,
      required: true,
    },
    assetOut: {
      type: String,
      required: true,
    },
    network: {
      type: Schema.Types.ObjectId,
      ref: "Network",
      required: true,
    },
    hash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("OffRampOder", OffRampOderSchema);
