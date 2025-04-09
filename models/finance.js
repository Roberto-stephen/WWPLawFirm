const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const financeSchema = new Schema({
  description: {
    type: String,
    required: [true, 'Deskripsi keuangan diperlukan'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Jumlah diperlukan']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Tipe transaksi diperlukan']
  },
  category: {
    type: String,
    required: [true, 'Kategori diperlukan']
  },
  case: {
    type: Schema.Types.ObjectId,
    ref: 'Case'
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Perekam transaksi diperlukan']
  },
  transactionDate: {
    type: Date,
    required: [true, 'Tanggal transaksi diperlukan'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'transfer', 'check', 'credit_card', 'other'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'canceled'],
    default: 'completed'
  },
  notes: {
    type: String
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  invoiceNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Indexes
financeSchema.index({ type: 1 });
financeSchema.index({ case: 1 });
financeSchema.index({ client: 1 });
financeSchema.index({ transactionDate: 1 });
financeSchema.index({ category: 1 });
financeSchema.index({ status: 1 });

const FinanceModel = mongoose.model('Finance', financeSchema);

module.exports = FinanceModel;