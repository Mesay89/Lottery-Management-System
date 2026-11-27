'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { v4: uuidv4 } = require('uuid');

const prizeStructureSchema = new mongoose.Schema({
  rank:        { type: Number, required: true },
  description: { type: String, trim: true },
  amount:      { type: Number, required: true, min: 0 },
  currency:    { type: String, default: 'ETB' },
}, { _id: false });

const lotteryEventSchema = new mongoose.Schema(
  {
    eventId: {
      type:    String,
      unique:  true,
      default: () => `EVT-${uuidv4().split('-')[0].toUpperCase()}`,
    },
    name:        { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    ticketPrice: { type: Number, required: true, min: 0 },
    currency:    { type: String, default: 'ETB' },

    startDate:   { type: Date, required: true },
    closingDate: { type: Date, required: true },
    drawDate:    { type: Date, required: true },

    status: {
      type:    String,
      enum:    ['Draft', 'Scheduled', 'Open', 'Closed', 'Drawn', 'Published', 'Cancelled'],
      default: 'Draft',
    },

    prizeStructure:    { type: [prizeStructureSchema], default: [] },
    totalTickets:      { type: Number, required: true, min: 1 },
    soldTickets:       { type: Number, default: 0, min: 0 },
    remainingTickets:  { type: Number },

    participationRules: { type: String },
    minimumAge:         { type: Number, default: 18 },
    bannerImage:        { type: String },

    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt:  { type: Date },
  },
  { timestamps: true }
);

lotteryEventSchema.index({ status: 1 });
lotteryEventSchema.index({ drawDate: 1 });
lotteryEventSchema.index({ closingDate: 1 });
lotteryEventSchema.index({ eventId: 1 }, { unique: true });

// Auto-calculate remainingTickets
lotteryEventSchema.pre('save', function (next) {
  this.remainingTickets = this.totalTickets - this.soldTickets;
  next();
});

lotteryEventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('LotteryEvent', lotteryEventSchema);
