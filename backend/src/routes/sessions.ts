import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken, AuthRequest } from '../middleware/auth';
import {
  initSession,
  startSession,
  getSession,
} from '../services/sessionService';

const router = Router();

// POST /api/v1/sessions/init
router.post(
  '/init',
  [
    body('applicantName')
      .trim()
      .notEmpty()
      .withMessage('Applicant name is required')
      .isLength({ min: 2, max: 100 }),
    body('applicantPhone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
    body('loanAmount')
      .isNumeric()
      .withMessage('Loan amount must be a number')
      .custom((val) => val >= 10000 && val <= 5000000)
      .withMessage('Loan amount must be between ₹10,000 and ₹50,00,000'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    try {
      const result = await initSession({
        applicantName: req.body.applicantName,
        applicantPhone: req.body.applicantPhone,
        loanAmount: req.body.loanAmount,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Session initialized successfully',
      });
    } catch (error) {
      const err = error as Error & { statusCode?: number };
      res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Failed to initialize session',
      });
    }
  }
);

// POST /api/v1/sessions/:id/start
router.post(
  '/:id/start',
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const session = await startSession(
        req.params.id,
        req.session_data?.applicantRef || 'unknown'
      );

      res.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          status: session.status,
          startedAt: session.startedAt,
        },
        message: 'Session started successfully',
      });
    } catch (error) {
      const err = error as Error & { statusCode?: number };
      res.status(err.statusCode || 500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

// GET /api/v1/sessions/:id
router.get(
  '/:id',
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const session = await getSession(req.params.id);

      res.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          applicantRef: session.applicantRef,
          applicantName: session.applicantName,
          loanAmount: session.loanAmount,
          status: session.status,
          consentCaptured: session.consentCaptured,
          expiresAt: session.expiresAt,
          startedAt: session.startedAt,
          createdAt: session.createdAt,
        },
      });
    } catch (error) {
      const err = error as Error & { statusCode?: number };
      res.status(err.statusCode || 500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

export default router;
