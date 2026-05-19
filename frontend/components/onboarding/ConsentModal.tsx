'use client';

import React, { useState } from 'react';
import styles from './ConsentModal.module.css';
import { consentAPI } from '@/lib/api';

interface ConsentModalProps {
  sessionId: string;
  onConsented: () => void;
  onDecline?: () => void;
}

export default function ConsentModal({
  sessionId,
  onConsented,
  onDecline,
}: ConsentModalProps) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async () => {
    if (!checked) {
      setError('Please check the box to confirm your agreement.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await consentAPI.capture({
        sessionId,
        consentPhrase: 'I agree to proceed',
        checkboxChecked: checked,
      });
      onConsented();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(
        axiosErr?.response?.data?.error ||
          'Failed to record consent. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h2 className={styles.title}>Before We Begin</h2>
            <p className={styles.subtitle}>Please review and accept the consent terms</p>
          </div>
        </div>

        {/* Consent content */}
        <div className={styles.body}>
          <div className={styles.notice}>
            <div className={styles.noticeIcon}>📋</div>
            <p>
              This session will be <strong>recorded</strong> for compliance, fraud detection,
              and credit risk evaluation purposes. Your audio, video, and interaction data
              will be processed by our AI systems to evaluate your loan application.
            </p>
          </div>

          <div className={styles.terms}>
            <h3 className={styles.termsTitle}>Data Collection Notice</h3>
            <ul className={styles.termsList}>
              <li>
                <span className={styles.termDot} />
                Audio and video will be captured and processed using NVIDIA AI technology.
              </li>
              <li>
                <span className={styles.termDot} />
                Your responses will be analyzed for behavioral patterns, intent signals, and fraud indicators.
              </li>
              <li>
                <span className={styles.termDot} />
                All session data is stored securely and forms an immutable audit record.
              </li>
              <li>
                <span className={styles.termDot} />
                The AI analysis assists but does not solely determine the final lending decision.
              </li>
              <li>
                <span className={styles.termDot} />
                Final decisions are governed by deterministic policy rules for regulatory compliance.
              </li>
            </ul>
          </div>

          <div className={styles.verbal}>
            <p className={styles.verbalLabel}>Verbal Consent Instruction</p>
            <div className={styles.verbalPhrase}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
              </svg>
              <span>Please say aloud: <em>"I agree to proceed"</em></span>
            </div>
          </div>

          {/* Checkbox */}
          <label className={styles.checkboxLabel} htmlFor="consent-checkbox">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                setChecked(e.target.checked);
                setError(null);
              }}
              className={styles.checkbox}
            />
            <div className={styles.checkboxCustom}>
              {checked && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className={styles.checkboxText}>
              I have read and agree to the data collection terms. I consent to this session being recorded and processed for lending evaluation purposes.
            </span>
          </label>

          {error && (
            <div className={styles.error}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {onDecline && (
            <button
              id="consent-decline-btn"
              onClick={onDecline}
              className="btn btn-ghost"
              disabled={loading}
            >
              Decline
            </button>
          )}
          <button
            id="consent-agree-btn"
            onClick={handleConsent}
            className={`btn btn-primary ${styles.agreeBtn}`}
            disabled={!checked || loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner} />
                Recording Consent...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                I Agree — Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
