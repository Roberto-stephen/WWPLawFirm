const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activityLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  username: {
    type: String
  },
  action: {
    type: String,
    required: [true, 'Aksi diperlukan']
  },
  resource: {
    type: String,
    enum: ['user', 'case', 'document', 'hearing', 'appointment', 'task', 'finance', 'system'],
    required: [true, 'Jenis sumber daya diperlukan']
  },
  resourceId: {
    type: Schema.Types.ObjectId
  },
  details: {
    type: Object
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ resource: 1 });
activityLogSchema.index({ createdAt: 1 });

const ActivityLogModel = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLogModel;