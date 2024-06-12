const { Schema, model } = require('mongoose');
const crypto = require('crypto');

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
    apiKey: {
      type: String,
      unique: true,
    }
  },
  {
    collection: 'users',
    timestamps: true,
  }
);
userSchema.pre('save', function (next) {
  if (!this.apiKey) {
    this.apiKey = crypto.randomBytes(16).toString('hex');
  }
  next();
});

module.exports = model('User', userSchema);
