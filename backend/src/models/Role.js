'use strict';

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
      enum:     ['superAdmin', 'lotteryAdmin', 'cashManager', 'ticketAgent', 'customer'],
    },
    description: { type: String, trim: true },
    permissions:  { type: [String], default: [] },
    isDefault:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

roleSchema.index({ name: 1 });

module.exports = mongoose.model('Role', roleSchema);
