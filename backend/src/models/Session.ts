import mongoose, { Document, Schema } from 'mongoose';

export type SessionStatus = 'pending' | 'active' | 'completed' | 'expired' | 'rejected';

export interface ISession extends Document {
  sessionId: string;
  applicantRef: string;
  applicantName: string;
  applicantPhone: string;
  loanAmount: number;
  status: SessionStatus;
  token: string;
  expiresAt: Date;
  consentCaptured: boolean;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    applicantRef: {
      type: String,
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
    },
    applicantPhone: {
      type: String,
      required: true,
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'expired', 'rejected'],
      default: 'pending',
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consentCaptured: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto-expire documents
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ISession>('Session', SessionSchema);
