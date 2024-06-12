const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    user_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallets: [{ type: Schema.Types.ObjectId, ref: 'wallets' }],
    logo: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    admin: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

module.exports = model('User', userSchema);
