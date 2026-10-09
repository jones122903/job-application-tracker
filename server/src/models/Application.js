import mongoose from 'mongoose';

export const APPLICATION_STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];

const applicationSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  // Pass the function so each new document gets its own current date.
  applicationDate: { type: Date, default: Date.now, required: true },
  status: {
    type: String,
    enum: APPLICATION_STATUSES,
    default: 'Applied',
    required: true,
  },
  jobLink: { type: String, trim: true, default: '' },
  notes: { type: String, trim: true, default: '' },
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);
