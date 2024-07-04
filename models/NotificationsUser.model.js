const { Schema, model } = require('mongoose');

const NotificationsUserSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['seen', 'not seen', 'deleted'], required: true, default: "not seen" }
  },
  {
    collection: 'notifications_users',
    timestamps: true,
  }
);

// Definir virtuals
NotificationsUserSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

NotificationsUserSchema.set('toObject', { virtuals: true });
NotificationsUserSchema.set('toJSON', { virtuals: true });

module.exports = model('NotificationsUser', NotificationsUserSchema);
