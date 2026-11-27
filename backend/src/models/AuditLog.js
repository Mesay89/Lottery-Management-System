'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const auditLogSchema = new mongoose.Schema(
  {
    action:      { type: String, required: true, trim: true },
    resource:    { type: String, required: true, trim: true },
    resourceId:  { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedAt: { type: Date, default: Date.now, immutable: true },
    ipAddress:   { type: String },
    userAgent:   { type: String },
    changes:     { type: mongoose.Schema.Types.Mixed },
    description: { type: String },
  },
  {
    timestamps: false, // Only createdAt / performedAt — not modifiable
  }
);

auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ performedAt: -1 });
auditLogSchema.index({ action: 1 });

auditLogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('AuditLog', auditLogSchema);
