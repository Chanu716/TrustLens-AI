'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: '🧠',
    title: 'Cognitive Interview Engine',
    desc: 'Adaptive AI-led interview with dynamic follow-ups and clarification loops — no static forms.',
  },
  {
    icon: '📊',
    title: 'Behavioral Trust Scoring',
    desc: 'Real-time trust score (0–100) built from hesitation, consistency, and vocal confidence signals.',
  },
  {
    icon: '🎯',
    title: 'Intent & Emotion Detection',
    desc: 'Infers loan urgency, financial stress, and repayment mindset from language and tone patterns.',
  },
  {
    icon: '🛡️',
    title: 'Multimodal Fraud Detection',
    desc: 'Fuses audio, video, and metadata anomalies to flag suspicious signals in real time.',
  },
  {
    icon: '⚖️',
    title: 'Deterministic Policy Engine',
    desc: 'AI advises; policy rules decide. Every outcome is compliant, explainable, and audit-ready.',
  },
  {
    icon: '💡',
    title: 'Smart Loan Offer Engine',
    desc: 'Dynamic personalization of amount, EMI, and tenure based on trust and risk profile.',
  },
];

const STATS = [
  { value: '< 2 min', label: 'Onboarding Decision' },
  { value: '94%', label: 'Fraud Catch Rate' },
  { value: '0', label: 'Static Forms' },
  { value: '100%', label: 'Audit Traceable' },
];

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; color: string;
    };

    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '#00c8ff' : '#00ff9d',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      // Draw connection lines
      ctx.globalAlpha = 1;
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = (1 - dist / 120) * 0.15;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ─── Canvas Background ─────────────────────────────────── */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            <span className="badge badge-trust">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-trust)', display: 'inline-block' }} />
              NVIDIA-Powered AI Onboarding
            </span>
          </div>

          <h1 className={styles.heroTitle}>
            Trust at First<br />
            <span className="gradient-text">Conversation</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Real-time AI video onboarding for digital lending. Evaluate what applicants say,
            how they behave, and whether their signals are trustworthy — then produce a fast,
            explainable lending decision.
          </p>

          <div className={styles.heroCta}>
            <Link href="/onboarding" className="btn btn-primary" id="hero-start-btn" style={{ fontSize: '16px', padding: '14px 32px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Begin Onboarding
            </Link>
            <Link href="/onboarding" className="btn btn-ghost" id="hero-demo-btn" style={{ fontSize: '16px', padding: '14px 32px' }}>
              View Demo
            </Link>
          </div>

          {/* Stats row */}
          <div className={styles.stats}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className={styles.heroVisual}>
          <div className={styles.trustCard}>
            <div className={styles.trustCardHeader}>
              <div className={styles.trustDot} />
              <span>Live Trust Analysis</span>
              <span className="badge badge-trust" style={{ marginLeft: 'auto' }}>ACTIVE</span>
            </div>

            <div className={styles.trustGauge}>
              <svg viewBox="0 0 120 80" className={styles.gaugeSvg}>
                {/* Background arc */}
                <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
                {/* Trust arc */}
                <path d="M 10 70 A 50 50 0 0 1 98 32" fill="none" stroke="url(#tg)" strokeWidth="8" strokeLinecap="round" />
                <defs>
                  <linearGradient id="tg" x1="0" y1="0" x2="1" y2="0">
                    <stop stopColor="#00c8ff" />
                    <stop offset="1" stopColor="#00ff9d" />
                  </linearGradient>
                </defs>
                <text x="60" y="68" textAnchor="middle" fill="#f0f2ff" fontSize="22" fontWeight="700" fontFamily="Syne, sans-serif">78</text>
                <text x="60" y="80" textAnchor="middle" fill="#8892b0" fontSize="8" fontFamily="Inter, sans-serif">TRUST SCORE</text>
              </svg>
            </div>

            <div className={styles.trustFactors}>
              {[
                { label: 'Response Consistency', val: 82, color: 'var(--color-trust)' },
                { label: 'Voice Confidence', val: 75, color: 'var(--color-primary)' },
                { label: 'Behavioral Stability', val: 71, color: 'var(--color-primary)' },
                { label: 'Fraud Signals', val: 12, color: 'var(--color-warn)', inverse: true },
              ].map((f) => (
                <div key={f.label} className={styles.factor}>
                  <div className={styles.factorLabel}>
                    <span>{f.label}</span>
                    <span style={{ color: f.color }}>{f.inverse ? `${f.val}%` : `${f.val}/100`}</span>
                  </div>
                  <div className={styles.factorBar}>
                    <div
                      className={styles.factorFill}
                      style={{ width: `${f.val}%`, background: f.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.trustDecision}>
              <span className="badge badge-trust">✓ Policy Compliant</span>
              <span className="badge badge-primary">Offer Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Eight Layers of <span className="gradient-text">Trust Intelligence</span>
            </h2>
            <p className={styles.sectionDesc}>
              Every conversation is evaluated across behavioral, semantic, emotional, and visual dimensions simultaneously.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`card card-hover ${styles.featureCard}`} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ──────────────────────────────────────── */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              How <span className="gradient-text">TrustLens</span> Works
            </h2>
          </div>

          <div className={styles.steps}>
            {[
              { n: '01', title: 'Secure Session', desc: 'Applicant joins tokenized video session. Camera, mic, and metadata capture begin.' },
              { n: '02', title: 'Consent & Verification', desc: 'Verbal and digital consent is captured and anchored to an immutable audit record.' },
              { n: '03', title: 'AI-Led Interview', desc: 'NVIDIA Riva + NeMo power adaptive questioning, behavioral analysis, and intent detection.' },
              { n: '04', title: 'Decision & Offer', desc: 'Policy engine enforces compliance guardrails. Smart Offer Engine personalizes the loan terms.' },
            ].map((s) => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to experience <span className="gradient-text">AI-first lending?</span></h2>
          <p className={styles.ctaDesc}>Start a live onboarding session and see TrustLens AI in action.</p>
          <Link href="/onboarding" className="btn btn-primary" id="cta-start-btn" style={{ fontSize: '16px', padding: '14px 36px' }}>
            Start Your Session →
          </Link>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>TrustLens <span className="gradient-text">AI</span></span>
          <span className={styles.footerSub}>Compliance-first real-time video onboarding for digital lending.</span>
          <span className={styles.footerMeta}>Phase 1 — Foundation & Infrastructure</span>
        </div>
      </footer>
    </div>
  );
}
