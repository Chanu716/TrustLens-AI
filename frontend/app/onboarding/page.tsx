'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { sessionAPI } from '@/lib/api';
import { saveSession, formatLoanAmount } from '@/lib/session';
import styles from './page.module.css';

const LOAN_PRESETS = [50000, 100000, 250000, 500000, 1000000];

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    applicantName: '',
    applicantPhone: '',
    loanAmount: 100000,
    customAmount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.applicantName.trim() || form.applicantName.trim().length < 2)
      errs.applicantName = 'Please enter your full name (minimum 2 characters)';
    if (!/^[6-9]\d{9}$/.test(form.applicantPhone))
      errs.applicantPhone = 'Enter a valid 10-digit Indian mobile number';
    if (form.loanAmount < 10000 || form.loanAmount > 5000000)
      errs.loanAmount = 'Loan amount must be between ₹10,000 and ₹50,00,000';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const res = await sessionAPI.init({
        applicantName: form.applicantName.trim(),
        applicantPhone: form.applicantPhone.trim(),
        loanAmount: form.loanAmount,
      });

      const { sessionId, token } = res.data.data;
      saveSession(sessionId, token);
      router.push(`/onboarding/session/${sessionId}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; errors?: { msg: string }[] } } };
      const msg =
        axiosErr?.response?.data?.errors?.[0]?.msg ||
        axiosErr?.response?.data?.error ||
        'Failed to initialize session. Please check if the backend is running.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const setAmount = (amount: number) => {
    setForm((f) => ({ ...f, loanAmount: amount, customAmount: '' }));
    setErrors((e) => ({ ...e, loanAmount: '' }));
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Left: Info */}
          <div className={styles.info}>
            <div className={styles.infoEyebrow}>
              <span className="badge badge-primary">Step 1 of 3</span>
            </div>
            <h1 className={styles.infoTitle}>
              Start Your <span className="gradient-text">Loan Application</span>
            </h1>
            <p className={styles.infoDesc}>
              Begin a secure AI-led onboarding session. Provide your basic details to initialize your session token.
            </p>

            <div className={styles.infoPoints}>
              {[
                { icon: '🔒', text: 'Tokenized secure session — 2-hour validity' },
                { icon: '🎥', text: 'Live video AI interview — no forms, just conversation' },
                { icon: '⚡', text: 'Decision in under 2 minutes' },
                { icon: '📋', text: 'Full consent capture before any data processing' },
              ].map((p) => (
                <div key={p.text} className={styles.infoPoint}>
                  <span className={styles.infoPointIcon}>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <form className={styles.form} onSubmit={handleSubmit} id="onboarding-form">
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="applicantName">Full Name</label>
              <input
                id="applicantName"
                type="text"
                className={`input ${errors.applicantName ? 'error' : ''}`}
                placeholder="e.g. Rahul Sharma"
                value={form.applicantName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, applicantName: e.target.value }));
                  setErrors((er) => ({ ...er, applicantName: '' }));
                }}
                disabled={loading}
                autoComplete="name"
              />
              {errors.applicantName && <span className={styles.fieldError}>{errors.applicantName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="applicantPhone">Mobile Number</label>
              <div className={styles.phoneInput}>
                <span className={styles.phonePrefix}>+91</span>
                <input
                  id="applicantPhone"
                  type="tel"
                  className={`input ${styles.phoneField} ${errors.applicantPhone ? 'error' : ''}`}
                  placeholder="9876543210"
                  value={form.applicantPhone}
                  maxLength={10}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm((f) => ({ ...f, applicantPhone: val }));
                    setErrors((er) => ({ ...er, applicantPhone: '' }));
                  }}
                  disabled={loading}
                />
              </div>
              {errors.applicantPhone && <span className={styles.fieldError}>{errors.applicantPhone}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Loan Amount</label>
              <div className={styles.presets}>
                {LOAN_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    id={`preset-${amt}`}
                    className={`${styles.preset} ${form.loanAmount === amt ? styles.presetActive : ''}`}
                    onClick={() => setAmount(amt)}
                    disabled={loading}
                  >
                    {formatLoanAmount(amt)}
                  </button>
                ))}
              </div>
              <input
                id="customAmount"
                type="number"
                className={`input ${errors.loanAmount ? 'error' : ''}`}
                placeholder="Or enter a custom amount (₹)"
                value={form.customAmount}
                min={10000}
                max={5000000}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm((f) => ({ ...f, customAmount: e.target.value, loanAmount: val }));
                  setErrors((er) => ({ ...er, loanAmount: '' }));
                }}
                disabled={loading}
                style={{ marginTop: 'var(--space-2)' }}
              />
              {form.loanAmount > 0 && !errors.loanAmount && (
                <p className={styles.amountDisplay}>
                  Selected: <strong>{formatLoanAmount(form.loanAmount)}</strong>
                </p>
              )}
              {errors.loanAmount && <span className={styles.fieldError}>{errors.loanAmount}</span>}
            </div>

            {serverError && (
              <div className={styles.serverError}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{serverError}</span>
              </div>
            )}

            <button
              id="submit-onboarding-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              {loading ? (
                <>
                  <div className={styles.spinner} />
                  Initializing Session...
                </>
              ) : (
                <>
                  Initialize Session →
                </>
              )}
            </button>

            <p className={styles.formNote}>
              By proceeding, you agree to a recorded AI interview session. Your data is processed securely.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
