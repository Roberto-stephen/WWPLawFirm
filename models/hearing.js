const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hearingSchema = new Schema({
  case: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, 'Kasus diperlukan']
  },
  title: {
    type: String,
    required: [true, 'Judul sidang diperlukan'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Tanggal sidang diperlukan']
  },
  time: {
    start: {
      type: String,
      required: [true, 'Waktu mulai sidang diperlukan']
    },
    end: {
      type: String
    }
  },
  location: {
    type: String,
    required: [true, 'Lokasi sidang diperlukan']
  },
  agenda: {
    type: String,
    required: [true, 'Agenda sidang diperlukan']
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'postponed', 'canceled'],
    default: 'scheduled'
  },
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  result: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
hearingSchema.index({ case: 1 });
hearingSchema.index({ date: 1 });
hearingSchema.index({ status: 1 });

const HearingModel = mongoose.model('Hearing', hearingSchema);

module.exports = HearingModel;