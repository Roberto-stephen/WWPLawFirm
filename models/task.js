const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Judul tugas diperlukan'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Deskripsi tugas diperlukan']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Penugasan diperlukan']
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pemberi tugas diperlukan']
  },
  case: {
    type: Schema.Types.ObjectId,
    ref: 'Case'
  },
  dueDate: {
    type: Date,
    required: [true, 'Tanggal jatuh tempo diperlukan']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'pending', 'completed', 'canceled'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  notes: {
    type: String
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  subTasks: [{
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ case: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });

const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;