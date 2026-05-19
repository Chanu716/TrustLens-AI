'use client';

import React, { useEffect, useState } from 'react';
import styles from './SessionHeader.module.css';

interface SessionHeaderProps {
  sessionId: string;
  status: 'pending' | 'active' | 'completed' | 'expired' | 'rejected';
  consentCaptured: boolean;
  startedAt?: string;
}

export default function SessionHeader({
  sessionId,
  status,
  consentCaptured,
  startedAt,
}: SessionHeaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== 'active' || !startedAt) return;

    const start = new Date(startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, startedAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const shortId = sessionId.split('-')[0].toUpperCase();

  const statusConfig = {
    pending:   { color: 'var(--color-warn)', label: 'Pending' },
    active:    { color: 'var(--color-trust)', label: 'Active' },
    completed: { color: 'var(--color-primary)', label: 'Completed' },
    expired:   { color: 'var(--color-danger)', label: 'Expired' },
    rejected:  { color: 'var(--color-danger)', label: 'Rejected' },
  };

  const cfg = statusConfig[status];

  return (
    <div className={styles.header}>
      {/* Session ID */}
      <div className={styles.sessionInfo}>
        <span className={styles.sessionLabel}>Session</span>
        <code className={styles.sessionId}>{shortId}</code>
      </div>

      {/* Status */}
      <div className={styles.statusChip} style={{ '--dot-color': cfg.color } as React.CSSProperties}>
        <div className={styles.statusDot} />
        <span className={styles.statusText}>{cfg.label}</span>
      </div>

      {/* KYC Steps */}
      <div className={styles.kycSteps}>
        <KycStep label="Consent" done={consentCaptured} />
        <KycStep label="Face Check" done={status === 'active'} pending={!consentCaptured} />
        <KycStep label="Interview" done={false} pending={status !== 'active'} />
      </div>

      {/* Timer */}
      {status === 'active' && (
        <div className={styles.timer}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span className={styles.timerText}>{formatTime(elapsed)}</span>
        </div>
      )}
    </div>
  );
}

function KycStep({ label, done, pending }: { label: string; done: boolean; pending?: boolean }) {
  return (
    <div className={`${styles.kycStep} ${done ? styles.kycStepDone : pending ? styles.kycStepPending : ''}`}>
      <div className={styles.kycIcon}>
        {done ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : pending ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        )}
      </div>
      <span>{label}</span>
    </div>
  );
}
