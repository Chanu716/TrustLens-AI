import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import Session, { ISession, SessionStatus } from '../models/Session';

interface InitSessionInput {
  applicantName: string;
  applicantPhone: string;
  loanAmount: number;
}

interface InitSessionResult {
  sessionId: string;
  token: string;
  expiresAt: Date;
  applicantRef: string;
}

export const initSession = async (
  input: InitSessionInput
): Promise<InitSessionResult> => {
  const sessionId = uuidv4();
  const applicantRef = `APP-${uuidv4().split('-')[0].toUpperCase()}`;

  const secret = process.env.JWT_SECRET;
  const expiresIn = (process.env.JWT_EXPIRES_IN as string) || '2h';

  if (!secret) throw new Error('JWT_SECRET not configured');

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);

  const token = jwt.sign({ sessionId, applicantRef }, secret, {
    expiresIn,
  } as jwt.SignOptions);

  await Session.create({
    sessionId,
    applicantRef,
    applicantName: input.applicantName,
    applicantPhone: input.applicantPhone,
    loanAmount: input.loanAmount,
    token,
    expiresAt,
    status: 'pending',
    consentCaptured: false,
  });

  return { sessionId, token, expiresAt, applicantRef };
};

export const startSession = async (
  sessionId: string,
  requestedBy: string
): Promise<ISession> => {
  const session = await Session.findOne({ sessionId });

  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  if (session.status === 'expired')
    throw Object.assign(new Error('Session has expired'), { statusCode: 410 });
  if (session.status === 'active')
    return session; // idempotent
  if (!session.consentCaptured)
    throw Object.assign(new Error('Consent must be captured before starting session'), {
      statusCode: 400,
    });

  session.status = 'active';
  session.startedAt = new Date();
  await session.save();

  return session;
};

export const getSession = async (sessionId: string): Promise<ISession> => {
  const session = await Session.findOne({ sessionId });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  return session;
};

export const updateSessionStatus = async (
  sessionId: string,
  status: SessionStatus
): Promise<ISession> => {
  const session = await Session.findOneAndUpdate(
    { sessionId },
    {
      status,
      ...(status === 'completed' ? { completedAt: new Date() } : {}),
    },
    { new: true }
  );
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  return session;
};
