'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { v4: uuidv4 } = require('uuid');

const drawSchema = new mongoose.Schema(
  {
    drawId: {
      type:    String,
      unique:  true,
      default: () => `DRW-${uuidv4().split('-')[0].toUpperCase()}`,
    },
    lotteryEvent: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'LotteryEvent',
      required: true,
    },
    scheduledDate: { type: Date, required: true },
    actualDate:    { type: Date },
    status: {
      type:    String,
      enum:    ['Scheduled', 'InProgress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    winningNumbers:  { type: [String], default: [] },
    winningTickets:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    conductedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    witnessedBy:     { type: [String], default: [] },
    notes:           { type: String },
    drawMethod: {
      type:    String,
      enum:    ['manual', 'random', 'hybrid'],
      default: 'random',
    },
  },
  { timestamps: true }
);

drawSchema.index({ lotteryEvent: 1 });
drawSchema.index({ status: 1 });
drawSchema.index({ scheduledDate: 1 });

drawSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Draw', drawSchema);
