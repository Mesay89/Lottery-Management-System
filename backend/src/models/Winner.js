'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { v4: uuidv4 } = require('uuid');

const winnerSchema = new mongoose.Schema(
  {
    winnerId: {
      type:    String,
      unique:  true,
      default: () => `WIN-${uuidv4().split('-')[0].toUpperCase()}`,
    },
    lotteryEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'LotteryEvent', required: true },
    result:        { type: mongoose.Schema.Types.ObjectId, ref: 'Result', required: true },
    ticket:        { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket',  required: true },
    customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    prizeRank:   { type: Number, required: true },
    prizeAmount: { type: Number, required: true },
    currency:    { type: String, default: 'ETB' },

    verificationStatus: {
      type:    String,
      enum:    ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verifiedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt:  { type: Date },

    claimStatus: {
      type:    String,
      enum:    ['Unclaimed', 'Claimed', 'Expired'],
      default: 'Unclaimed',
    },
  },
  { timestamps: true }
);

winnerSchema.index({ lotteryEvent: 1 });
winnerSchema.index({ customer: 1 });
winnerSchema.index({ claimStatus: 1 });
winnerSchema.index({ verificationStatus: 1 });

winnerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Winner', winnerSchema);
