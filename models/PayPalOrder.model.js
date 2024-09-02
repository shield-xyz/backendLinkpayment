const { Schema, model } = require("mongoose");

const PayPalOrderSchema = new Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
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
    amount: {
      type: String,
      required: true,
    },
    asset: {
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

module.exports = model("PayPalOrder", PayPalOrderSchema);
