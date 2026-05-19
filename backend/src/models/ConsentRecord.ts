import mongoose, { Document, Schema } from 'mongoose';

export interface IConsentRecord extends Document {
  sessionId: string;
  consentPhrase: string;
  capturedAt: Date;
  isValid: boolean;
  consentType: 'digital' | 'verbal';
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    checkboxChecked: boolean;
  };
}

const ConsentRecordSchema = new Schema<IConsentRecord>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    consentPhrase: {
      type: String,
      required: true,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    consentType: {
      type: String,
      enum: ['digital', 'verbal'],
      default: 'digital',
    },
    metadata: {
      userAgent: { type: String },
      ipAddress: { type: String },
      checkboxChecked: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);
