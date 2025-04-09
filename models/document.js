const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Judul dokumen diperlukan'],
    trim: true
  },
  description: {
    type: String,
  },
  fileUrl: {
    type: String,
    required: [true, 'URL file diperlukan']
  },
  fileType: {
    type: String,
    required: [true, 'Tipe file diperlukan']
  },
  fileSize: {
    type: Number,
    required: [true, 'Ukuran file diperlukan']
  },
  case: {
    type: Schema.Types.ObjectId,
    ref: 'Case'
  },
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pengunggah dokumen diperlukan']
  },
  category: {
    type: String,
    enum: ['Gugatan', 'Jawaban', 'Replik', 'Duplik', 'Bukti', 'Putusan', 'Dokumen Pendukung', 'Lainnya'],
    default: 'Lainnya'
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  accessibleTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ title: 'text', description: 'text' });
documentSchema.index({ case: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ uploader: 1 });

const DocumentModel = mongoose.model('Document', documentSchema);

module.exports = DocumentModel;