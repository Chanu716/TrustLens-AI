import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  session_data?: {
    sessionId: string;
    applicantRef: string;
  };
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authorization token missing or malformed',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ success: false, error: 'JWT secret not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      sessionId: string;
      applicantRef: string;
    };
    req.session_data = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Session token has expired' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid session token' });
    }
  }
};
