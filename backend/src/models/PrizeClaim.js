'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { v4: uuidv4 } = require('uuid');

const claimantDetailsSchema = new mongoose.Schema({
  fullName:    { type: String, trim: true },
  phone:       { type: String, trim: true },
  email:       { type: String, trim: true, lowercase: true },
  nationalId:  { type: String, trim: true },
  bankAccount: { type: String, trim: true },
  bankName:    { type: String, trim: true },
}, { _id: false });

const prizeClaimSchema = new mongoose.Schema(
  {
    claimReference: {
      type:    String,
      unique:  true,
      default: () => `CLM-${uuidv4().split('-')[0].toUpperCase()}`,
    },
    winner:       { type: mongoose.Schema.Types.ObjectId, ref: 'Winner',       required: true },
    customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
    lotteryEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'LotteryEvent', required: true },
    ticket:       { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket',       required: true },
    prize:        { type: mongoose.Schema.Types.ObjectId, ref: 'Prize' },

    status: {
      type:    String,
      enum:    ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'],
      default: 'Submitted',
    },

    submittedAt: { type: Date, default: Date.now },
    reviewedAt:  { type: Date },
    approvedAt:  { type: Date },
    paidAt:      { type: Date },

    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    claimantDetails: { type: claimantDetailsSchema },
    paymentMethod: {
      type: String,
      enum: ['telebirr', 'cbe', 'bank_transfer', 'cash'],
    },
    paymentReference: { type: String },
    notes:            { type: String },
    rejectionReason:  { type: String },
    documents:        { type: [String], default: [] },
  },
  { timestamps: true }
);

prizeClaimSchema.index({ customer: 1 });
prizeClaimSchema.index({ status: 1 });
prizeClaimSchema.index({ lotteryEvent: 1 });
prizeClaimSchema.index({ claimReference: 1 }, { unique: true });

prizeClaimSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('PrizeClaim', prizeClaimSchema);
