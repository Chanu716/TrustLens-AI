import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { verifyToken, AuthRequest } from '../middleware/auth';
import ConsentRecord from '../models/ConsentRecord';
import Session from '../models/Session';

const router = Router();

// POST /api/v1/consent/capture
router.post(
  '/capture',
  verifyToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('consentPhrase').notEmpty().withMessage('Consent phrase is required'),
    body('checkboxChecked').isBoolean().withMessage('Checkbox state required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { sessionId, consentPhrase, checkboxChecked } = req.body;

    try {
      // Verify session exists and is in pending state
      const session = await Session.findOne({ sessionId });
      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }
      if (session.consentCaptured) {
        res.status(409).json({ success: false, error: 'Consent already captured for this session' });
        return;
      }
      if (session.status === 'expired') {
        res.status(410).json({ success: false, error: 'Session has expired' });
        return;
      }

      // Validate consent phrase
      const validPhrases = [
        'i agree to proceed',
        'i agree',
        'yes i agree',
        'yes, i agree to proceed',
      ];
      const normalizedPhrase = consentPhrase.toLowerCase().trim();
      const isValid =
        checkboxChecked && validPhrases.some((p) => normalizedPhrase.includes(p));

      // Create immutable consent record
      const consentRecord = await ConsentRecord.create({
        sessionId,
        consentPhrase,
        capturedAt: new Date(),
        isValid,
        consentType: 'digital',
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          checkboxChecked,
        },
      });

      if (!isValid) {
        res.status(400).json({
          success: false,
          error: 'Consent phrase not recognized. Please confirm your agreement.',
          consentRecordId: consentRecord._id,
        });
        return;
      }

      // Mark session as consent captured
      session.consentCaptured = true;
      await session.save();

      res.status(201).json({
        success: true,
        data: {
          consentRecordId: consentRecord._id,
          sessionId,
          capturedAt: consentRecord.capturedAt,
          isValid: consentRecord.isValid,
        },
        message: 'Consent captured and recorded successfully',
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

export default router;
