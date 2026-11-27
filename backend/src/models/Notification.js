'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type:     String,
      required: true,
      enum:     ['email', 'sms', 'push', 'in_app'],
    },
    title:   { type: String, required: true, trim: true },
    message: { type: String, required: true },
    data:    { type: mongoose.Schema.Types.Mixed },

    status: {
      type:    String,
      enum:    ['Pending', 'Sent', 'Failed', 'Read'],
      default: 'Pending',
    },

    sentAt:       { type: Date },
    readAt:       { type: Date },
    lotteryEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'LotteryEvent' },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ recipient: 1, status: 1 });

notificationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Notification', notificationSchema);
