const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Judul janji temu diperlukan'],
    trim: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Klien diperlukan']
  },
  lawyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pengacara diperlukan']
  },
  date: {
    type: Date,
    required: [true, 'Tanggal janji temu diperlukan']
  },
  time: {
    start: {
      type: String,
      required: [true, 'Waktu mulai janji temu diperlukan']
    },
    end: {
      type: String
    }
  },
  location: {
    type: String,
    required: [true, 'Lokasi janji temu diperlukan']
  },
  purpose: {
    type: String,
    required: [true, 'Tujuan janji temu diperlukan']
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'canceled', 'rescheduled'],
    default: 'pending'
  },
  case: {
    type: Schema.Types.ObjectId,
    ref: 'Case'
  },
  reminder: {
    isSent: {
      type: Boolean,
      default: false
    },
    time: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes
appointmentSchema.index({ client: 1 });
appointmentSchema.index({ lawyer: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ case: 1 });

const AppointmentModel = mongoose.model('Appointment', appointmentSchema);

module.exports = AppointmentModel;