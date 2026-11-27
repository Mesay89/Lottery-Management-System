'use strict';

const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema(
  {
    lotteryEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'LotteryEvent', required: true },
    rank:         { type: Number, required: true },
    name:         { type: String, required: true, trim: true },
    description:  { type: String, trim: true },
    prizeType: {
      type:    String,
      enum:    ['cash', 'item', 'voucher'],
      default: 'cash',
    },
    amount:      { type: Number, min: 0 },
    currency:    { type: String, default: 'ETB' },
    quantity:    { type: Number, default: 1, min: 1 },
    sponsoredBy: { type: String, trim: true },
    imageUrl:    { type: String },
  },
  { timestamps: true }
);

prizeSchema.index({ lotteryEvent: 1 });
prizeSchema.index({ lotteryEvent: 1, rank: 1 }, { unique: true });

module.exports = mongoose.model('Prize', prizeSchema);
