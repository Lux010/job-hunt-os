import mongoose from 'mongoose';

const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];

const jobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    location: { type: String, trim: true },
    salary: { type: String, trim: true },
    deadline: { type: Date },
    notes: { type: String, trim: true },
    status: { type: String, enum: STATUSES, default: 'Applied', index: true },
    appliedAt: { type: Date, default: Date.now },
    nextFollowUp: { type: Date },
    contacted: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export { STATUSES };
export const Job = mongoose.model('Job', jobSchema);
