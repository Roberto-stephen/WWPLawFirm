const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Judul notifikasi diperlukan']
  },
  message: {
    type: String,
    required: [true, 'Pesan notifikasi diperlukan']
  },
  type: {
    type: String,
    enum: ['case', 'task', 'appointment', 'document', 'user', 'system', 'other'],
    default: 'other'
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Penerima notifikasi diperlukan']
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Case', 'Task', 'Appointment', 'Document', 'User', 'Hearing', null],
      default: null
    },
    id: {
      type: Schema.Types.ObjectId,
      refPath: 'relatedTo.model'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isImportant: {
    type: Boolean,
    default: false
  },
  link: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ type: 1 });

const NotificationModel = mongoose.model('Notification', notificationSchema);

module.exports = NotificationModel;