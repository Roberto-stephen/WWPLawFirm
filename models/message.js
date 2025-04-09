const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pengirim pesan diperlukan']
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Penerima pesan diperlukan']
  },
  case: {
    type: Schema.Types.ObjectId,
    ref: 'Case'
  },
  content: {
    type: String,
    required: [true, 'Konten pesan diperlukan']
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ case: 1 });
messageSchema.index({ isRead: 1 });
messageSchema.index({ createdAt: 1 });

const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;