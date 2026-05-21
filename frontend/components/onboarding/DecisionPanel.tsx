'use client';

import React from 'react';
import styles from './DecisionPanel.module.css';
import type { TimelineEvent } from './TrustTimeline';
import TrustTimeline from './TrustTimeline';

export type DecisionStatus = 'approved' | 'rejected' | 'manual_review';

interface LoanOffer {
  profile: string;
  approvedAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiEstimate: number;
  rationale: string;
}

interface DecisionData {
  trustScore: number;
  policyDecision: {
    status: DecisionStatus;
    riskScore: number;
    reasonCodes: string[];
    eligibleForOffer: boolean;
  };
  fraudResult: {
    fraudScore: number;
    riskLevel: string;
    flags: string[];
  };
  offer: LoanOffer | null;
  timestamp: string;
}

interface DecisionPanelProps {
  decision: DecisionData;
  timeline: TimelineEvent[];
}

const statusConfig = {
  approved: {
    icon: '✅',
    label: 'Application Approved',
    color: 'var(--color-trust)',
    bg: 'rgba(0, 255, 157, 0.08)',
    border: 'rgba(0, 255, 157, 0.3)',
  },
  rejected: {
    icon: '❌',
    label: 'Application Rejected',
    color: 'var(--color-danger)',
    bg: 'rgba(255, 77, 109, 0.08)',
    border: 'rgba(255, 77, 109, 0.3)',
  },
  manual_review: {
    icon: '🔍',
    label: 'Referred for Manual Review',
    color: '#f5a623',
    bg: 'rgba(245, 166, 35, 0.08)',
    border: 'rgba(245, 166, 35, 0.3)',
  },
};

const profileConfig: Record<string, { label: string; color: string }> = {
  aggressive: { label: 'Premium', color: 'var(--color-trust)' },
  balanced:   { label: 'Standard', color: 'var(--color-primary)' },
  conservative: { label: 'Guarded', color: '#f5a623' },
};

export default function DecisionPanel({ decision, timeline }: DecisionPanelProps) {
  const { policyDecision, fraudResult, offer, trustScore } = decision;
  const cfg = statusConfig[policyDecision.status];

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className={styles.panel}>
      {/* Decision Banner */}
      <div
        className={styles.banner}
        style={{ background: cfg.bg, borderColor: cfg.border }}
      >
        <span className={styles.bannerIcon}>{cfg.icon}</span>
        <div>
          <h2 className={styles.bannerTitle} style={{ color: cfg.color }}>
            {cfg.label}
          </h2>
          <p className={styles.bannerSub}>
            {new Date(decision.timestamp).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Scores Row */}
      <div className={styles.scoresGrid}>
        <div className={styles.scoreCard}>
          <p className={styles.scoreLabel}>Trust Score</p>
          <p className={styles.scoreValue} style={{ color: 'var(--color-trust)' }}>
            {trustScore}<span style={{ fontSize: 14 }}>/100</span>
          </p>
        </div>
        <div className={styles.scoreCard}>
          <p className={styles.scoreLabel}>Risk Score</p>
          <p className={styles.scoreValue} style={{ color: policyDecision.riskScore > 60 ? 'var(--color-danger)' : '#f5a623' }}>
            {policyDecision.riskScore}<span style={{ fontSize: 14 }}>/100</span>
          </p>
        </div>
        <div className={styles.scoreCard}>
          <p className={styles.scoreLabel}>Fraud Level</p>
          <p className={styles.scoreValue} style={{ color: fraudResult.riskLevel === 'low' ? 'var(--color-trust)' : 'var(--color-danger)', fontSize: 20, textTransform: 'uppercase' }}>
            {fraudResult.riskLevel}
          </p>
        </div>
      </div>

      {/* Reason Codes */}
      <div className={styles.reasonsCard}>
        <h4 className={styles.sectionTitle}>Decision Reason Codes</h4>
        <div className={styles.reasonsList}>
          {policyDecision.reasonCodes.map((code, i) => (
            <div key={i} className={styles.reasonItem}>
              <span className={styles.reasonDot} style={{ background: cfg.color }} />
              <span>{code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loan Offer (if approved) */}
      {offer && (
        <div className={styles.offerCard}>
          <div className={styles.offerHeader}>
            <h4 className={styles.sectionTitle}>Your Loan Offer</h4>
            <span
              className={styles.offerProfile}
              style={{ color: profileConfig[offer.profile]?.color ?? 'var(--color-primary)' }}
            >
              {profileConfig[offer.profile]?.label ?? offer.profile.toUpperCase()} OFFER
            </span>
          </div>

          <div className={styles.offerGrid}>
            <div className={styles.offerStat}>
              <p className={styles.offerStatLabel}>Approved Amount</p>
              <p className={styles.offerStatValue}>{formatCurrency(offer.approvedAmount)}</p>
            </div>
            <div className={styles.offerStat}>
              <p className={styles.offerStatLabel}>Interest Rate</p>
              <p className={styles.offerStatValue}>{offer.interestRate}% p.a.</p>
            </div>
            <div className={styles.offerStat}>
              <p className={styles.offerStatLabel}>Tenure</p>
              <p className={styles.offerStatValue}>{offer.tenureMonths} months</p>
            </div>
            <div className={styles.offerStat}>
              <p className={styles.offerStatLabel}>Est. Monthly EMI</p>
              <p className={styles.offerStatValue} style={{ color: 'var(--color-trust)' }}>
                {formatCurrency(offer.emiEstimate)}
              </p>
            </div>
          </div>

          <p className={styles.offerRationale}>{offer.rationale}</p>
        </div>
      )}

      {/* Trust Timeline */}
      <div className={styles.timelineCard}>
        <TrustTimeline events={timeline} />
      </div>
    </div>
  );
}
