'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new mongoose.Schema(
  {
    transactionRef: { type: String, required: true, unique: true, trim: true },
    type: {
      type:     String,
      required: true,
      enum:     ['ticket_purchase', 'prize_payment', 'refund'],
    },
    customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lotteryEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'LotteryEvent' },
    ticket:       { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },

    amount:   { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'ETB' },

    paymentMethod: {
      type:     String,
      required: true,
      enum:     ['telebirr', 'cbe', 'cash', 'bank_transfer'],
    },
    status: {
      type:    String,
      enum:    ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },

    telebirrRef:   { type: String },
    cbeRef:        { type: String },
    externalRef:   { type: String },
    screenshotUrl: { type: String },

    idempotencyKey: { type: String, unique: true, sparse: true },
    metadata:       { type: mongoose.Schema.Types.Mixed },

    processedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt:  { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true }
);

transactionSchema.index({ customer: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ lotteryEvent: 1 });
transactionSchema.index({ transactionRef: 1 }, { unique: true });
transactionSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

transactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', transactionSchema);
