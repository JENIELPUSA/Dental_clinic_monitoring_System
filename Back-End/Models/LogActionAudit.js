const mongoose = require('mongoose');

const logActionAuditSchema = new mongoose.Schema({
  action_type: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'],
  },
  performed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  module: {
    type: String,
    required: true,
    enum: ['Appointment', 'Treatment', 'Billing', 'User', 'Patient', 'Schedule', 'Insurance', 'Other'],
  },
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  old_data: {
    type: Object,
    default: null,
  },
  new_data: {
    type: Object,
    default: null,
  },
  ip_address: {
    type: String,
    default: null,
  }
});

module.exports = mongoose.model('LogActionAudit', logActionAuditSchema);
