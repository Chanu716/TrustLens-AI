'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import VideoFrame from '@/components/onboarding/VideoFrame';
import ConsentModal from '@/components/onboarding/ConsentModal';
import TrustMeter from '@/components/onboarding/TrustMeter';
import SessionHeader from '@/components/onboarding/SessionHeader';
import DecisionPanel from '@/components/onboarding/DecisionPanel';
import type { TimelineEvent } from '@/components/onboarding/TrustTimeline';
import { sessionAPI } from '@/lib/api';
import { getSessionToken, getSessionId } from '@/lib/session';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import styles from './page.module.css';

type SessionStatus = 'pending' | 'active' | 'completed' | 'expired' | 'rejected';

interface SessionData {
  sessionId: string;
  applicantRef: string;
  applicantName: string;
  loanAmount: number;
  status: SessionStatus;
  consentCaptured: boolean;
  expiresAt: string;
  startedAt?: string;
  createdAt: string;
}

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [starting, setStarting] = useState(false);
  const [streamReady, setStreamReady] = useState(false);

  // AI Telemetry State
  const [trustScore, setTrustScore] = useState(0);
  const [trustTrend, setTrustTrend] = useState('stable');
  const [activeEngines, setActiveEngines] = useState<Set<string>>(new Set());
  const [intentData, setIntentData] = useState<{ category?: string; urgency?: number; stability?: string }>({});

  // Phase 3: Decision & Timeline State
  const [decision, setDecision] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Load session on mount
  useEffect(() => {
    const token = getSessionToken();
    const storedId = getSessionId();

    if (!token || storedId !== sessionId) {
      router.replace('/onboarding');
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await sessionAPI.get(sessionId);
        const data = res.data.data as SessionData;
        setSession(data);

        if (!data.consentCaptured) {
          setShowConsent(true);
        }
      } catch {
        setError('Failed to load session. Please restart onboarding.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router]);

  // Connect socket when session is active
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const socket = connectSocket(sessionId);

    socket.on('session:status', (data: { status: SessionStatus }) => {
      setSession((prev) => prev ? { ...prev, status: data.status } : prev);
    });

    socket.on('ai:trust_update', (data: { score: number, trend: string }) => {
      setTrustScore(data.score);
      setTrustTrend(data.trend);
      setActiveEngines((prev) => new Set(prev).add('Behavioral Trust Engine'));
    });

    socket.on('ai:intent_update', (data: any) => {
      setIntentData({
        category: data.intentCategory,
        urgency: data.urgencyScore,
        stability: data.financialStability
      });
      setActiveEngines((prev) => new Set(prev).add('Intent & Emotion Layer'));
    });

    socket.on('ai:interview_question', () => {
      setActiveEngines((prev) => new Set(prev).add('Cognitive Interview'));
    });

    socket.on('ai:timeline_event', (event: TimelineEvent) => {
      setTimeline((prev) => [...prev, event]);
    });

    socket.on('session:complete', (data: any) => {
      setDecision(data);
      setSessionComplete(true);
      setActiveEngines((prev) => {
        const next = new Set(prev);
        next.add('Fraud Detection');
        next.add('Risk & Policy Engine');
        if (data.offer) next.add('Smart Offer Engine');
        return next;
      });
    });

    return () => {
      disconnectSocket(sessionId);
    };
  }, [session?.status, sessionId]);

  const handleConsented = async () => {
    setShowConsent(false);
    setStarting(true);

    try {
      const res = await sessionAPI.start(sessionId);
      setSession((prev) =>
        prev
          ? { ...prev, status: 'active', consentCaptured: true, startedAt: res.data.data.startedAt }
          : prev
      );
      
      // Trigger backend AI loop (pass loan amount for offer engine)
      const socket = connectSocket(sessionId);
      socket.emit('session:start_ai', { sessionId, loanAmount: session?.loanAmount ?? 50000 });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr?.response?.data?.error || 'Failed to start session.');
    } finally {
      setStarting(false);
    }
  };

  const handleDeclineConsent = () => {
    router.replace('/onboarding');
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Navbar />
        <div className={styles.loadingCenter}>
          <div className={styles.loadingSpinner} />
          <p>Loading your session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className={styles.loadingPage}>
        <Navbar />
        <div className={styles.errorCenter}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Session Error</h2>
          <p>{error || 'Session not found.'}</p>
          <button
            className="btn btn-primary"
            onClick={() => router.replace('/onboarding')}
          >
            Restart Onboarding
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Consent Modal */}
      {showConsent && (
        <ConsentModal
          sessionId={sessionId}
          onConsented={handleConsented}
          onDecline={handleDeclineConsent}
        />
      )}

      {/* Starting overlay */}
      {starting && (
        <div className={styles.startingOverlay}>
          <div className={styles.startingCard}>
            <div className={styles.startingSpinner} />
            <h3>Starting Session</h3>
            <p>Initializing your AI interview session...</p>
          </div>
        </div>
      )}

      <main className={styles.main}>
        {/* Session Header Bar */}
        <div className={styles.headerBar}>
          <SessionHeader
            sessionId={sessionId}
            status={session.status}
            consentCaptured={session.consentCaptured}
            startedAt={session.startedAt}
          />
        </div>

        {/* Main Content Grid — Live Interview or Decision Panel */}
        {sessionComplete && decision ? (
          <div className={styles.decisionView}>
            <DecisionPanel decision={decision} timeline={timeline} />
          </div>
        ) : (
        <div className={styles.grid}>

          {/* Left: Video + Controls */}
          <div className={styles.videoPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Live Session</h2>
              <span className={styles.panelSub}>
                {session.applicantName} — {formatCurrency(session.loanAmount)}
              </span>
            </div>

            <VideoFrame
              sessionId={sessionId}
              isActive={session.status === 'active'}
              onStreamReady={(stream) => {
                setStreamReady(true);
                console.log('Stream ready:', stream.id);
              }}
              onStreamError={(err) => {
                console.warn('Stream error:', err.message);
              }}
            />

            {/* Interview Step Card */}
            <div className={styles.stepCard}>
              <div className={styles.stepCardHeader}>
                <div className={styles.stepCardIcon}>
                  {session.status === 'active' ? '🎙️' : '⏳'}
                </div>
                <div>
                  <p className={styles.stepCardTitle}>
                    {session.status === 'active'
                      ? 'AI Interview in Progress'
                      : 'Waiting to Start'}
                  </p>
                  <p className={styles.stepCardDesc}>
                    {session.status === 'active'
                      ? 'Speak clearly and answer the AI\'s questions naturally.'
                      : 'Accept the consent terms to begin your interview.'}
                  </p>
                </div>
              </div>

              {session.status === 'active' && (
                <div className={styles.interviewHints}>
                  {[
                    'Speak clearly and at a natural pace',
                    'Answer questions honestly and completely',
                    'Ensure your face is visible and well-lit',
                  ].map((hint) => (
                    <div key={hint} className={styles.hint}>
                      <div className={styles.hintDot} />
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Intelligence Panel */}
          <div className={styles.intelligencePanel}>
            {/* Trust Meter */}
            <div className={styles.panelCard}>
              <h3 className={styles.panelCardTitle}>Trust Analysis</h3>
              <div className={styles.trustMeterWrapper}>
                <TrustMeter
                  score={trustScore}
                  analyzing={session.status !== 'active'}
                  label="Real-time Trust Score"
                />
              </div>
              {session.status !== 'active' ? (
                <p className={styles.pendingText}>
                  Trust analysis begins once the session starts
                </p>
              ) : (
                <p className={styles.pendingText} style={{ color: 'var(--color-primary)' }}>
                  Trend: <strong>{trustTrend}</strong>
                </p>
              )}
            </div>

            {/* Intent & Context (Visible when active) */}
            {session.status === 'active' && intentData.category && (
              <div className={styles.panelCard}>
                <h3 className={styles.panelCardTitle}>Intent Intelligence</h3>
                <div className={styles.detailsList}>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Detected Intent</span>
                    <span className={styles.detailValue} style={{ color: 'var(--color-primary)' }}>{intentData.category}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Financial Stability</span>
                    <span className={styles.detailValue} style={{
                       color: intentData.stability === 'Stable' ? 'var(--color-trust)' : 'var(--color-warn)'
                    }}>{intentData.stability}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Session Info */}
            <div className={styles.panelCard}>
              <h3 className={styles.panelCardTitle}>Session Details</h3>
              <div className={styles.detailsList}>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Applicant</span>
                  <span className={styles.detailValue}>{session.applicantName}</span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Loan Amount</span>
                  <span className={styles.detailValue} style={{ color: 'var(--color-trust)' }}>
                    {formatCurrency(session.loanAmount)}
                  </span>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Applicant Ref</span>
                  <code className={styles.detailCode}>{session.applicantRef}</code>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Session Expires</span>
                  <span className={styles.detailValue}>
                    {new Date(session.expiresAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Modules Status */}
            <div className={styles.panelCard}>
              <h3 className={styles.panelCardTitle}>AI Module Status</h3>
              <div className={styles.modulesList}>
                {[
                  { name: 'Cognitive Interview', active: activeEngines.has('Cognitive Interview') || session.status === 'active' },
                  { name: 'Behavioral Trust Engine', active: activeEngines.has('Behavioral Trust Engine') },
                  { name: 'Intent & Emotion Layer', active: activeEngines.has('Intent & Emotion Layer') },
                  { name: 'Fraud Detection', active: false },
                  { name: 'Risk & Policy Engine', active: false },
                  { name: 'Smart Offer Engine', active: false },
                ].map((mod) => (
                  <div key={mod.name} className={styles.module}>
                    <div
                      className={styles.moduleDot}
                      style={{
                        background: mod.active ? 'var(--color-trust)' : 'var(--color-text-muted)',
                        boxShadow: mod.active ? '0 0 8px var(--color-trust-glow)' : 'none',
                      }}
                    />
                    <span className={styles.moduleName}>{mod.name}</span>
                    <span
                      className={styles.moduleStatus}
                      style={{ color: mod.active ? 'var(--color-trust)' : 'var(--color-text-muted)' }}
                    >
                      {mod.active ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </div>
                ))}
              </div>
              <p className={styles.moduleNote}>System routes audio chunks to active engines</p>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
