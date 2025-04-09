const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const caseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Judul kasus diperlukan'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Deskripsi kasus diperlukan']
  },
  caseNumber: {
    type: String,
    required: [true, 'Nomor kasus diperlukan'],
    unique: true,
    trim: true
  },
  caseType: {
    type: String,
    required: [true, 'Tipe kasus diperlukan'],
    enum: ['Perdata', 'Pidana', 'Tata Usaha Negara', 'Lainnya']
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Klien diperlukan']
  },
  assignedLawyers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'pending', 'closed', 'won', 'lost'],
    default: 'open'
  },
  court: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Tanggal mulai diperlukan']
  },
  endDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  notes: {
    type: String
  },
  fees: {
    amount: Number,
    currency: {
      type: String,
      default: 'IDR'
    },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid'
    },
    details: String
  },
  hearings: [{
    type: Schema.Types.ObjectId,
    ref: 'Hearing'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
caseSchema.index({ title: 'text', description: 'text', caseNumber: 'text' });
caseSchema.index({ client: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ caseType: 1 });
caseSchema.index({ startDate: 1 });

const CaseModel = mongoose.model('Case', caseSchema);

module.exports = CaseModel;