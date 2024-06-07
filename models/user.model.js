const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    user_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallets: [{ type: Schema.Types.ObjectId, ref: 'wallets' }],
    description: {
      type: String,
    },
    image: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

module.exports = model('User', userSchema);
