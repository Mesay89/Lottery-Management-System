'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { v4: uuidv4 } = require('uuid');

const prizeBreakdownSchema = new mongoose.Schema({
  rank:          { type: Number },
  ticketNumbers: { type: [String], default: [] },
  prizeAmount:   { type: Number },
}, { _id: false });

const resultSchema = new mongoose.Schema(
  {
    resultId: {
      type:    String,
      unique:  true,
      default: () => `RES-${uuidv4().split('-')[0].toUpperCase()}`,
    },
    lotteryEvent: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'LotteryEvent',
      required: true,
    },
    draw: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Draw',
      required: true,
    },
    winningNumbers: { type: [String], default: [] },
    prizeBreakdown: { type: [prizeBreakdownSchema], default: [] },

    status: {
      type:    String,
      enum:    ['Draft', 'Published', 'Archived'],
      default: 'Draft',
    },

    publishedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt:  { type: Date },
    totalWinners:     { type: Number, default: 0 },
    totalPrizeAmount: { type: Number, default: 0 },

    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt:  { type: Date },
    notes:       { type: String },
  },
  { timestamps: true }
);

resultSchema.index({ lotteryEvent: 1 });
resultSchema.index({ status: 1 });

resultSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Result', resultSchema);
