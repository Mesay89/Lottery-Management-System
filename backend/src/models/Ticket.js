'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
      uppercase: true,
    },
    lotteryEvent: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'LotteryEvent',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    ownerName:  { type: String, trim: true },
    ownerPhone: { type: String, trim: true },
    ownerEmail: { type: String, trim: true, lowercase: true },

    status: {
      type:    String,
      enum:    ['Pending', 'Valid', 'Cancelled', 'Verified'],
      default: 'Valid',
    },

    purchaseDate: { type: Date, default: Date.now },
    purchaseChannel: {
      type:    String,
      enum:    ['online', 'agent'],
      default: 'online',
    },
    soldBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transactionRef: { type: String, trim: true },

    isWinner:    { type: Boolean, default: false },
    prizeRank:   { type: Number },
    prizeAmount: { type: Number },

    qrCode: { type: String },
  },
  { timestamps: true }
);

ticketSchema.index({ lotteryEvent: 1, ticketNumber: 1 }, { unique: true });
ticketSchema.index({ owner: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ lotteryEvent: 1, status: 1 });

ticketSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Ticket', ticketSchema);
