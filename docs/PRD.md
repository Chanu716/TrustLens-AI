# TrustLens AI — Product Requirements Document (PRD)

## 1. Product Vision
TrustLens AI is a compliance-first, real-time video onboarding platform for digital lending that combines conversational intelligence, behavioral trust analytics, fraud detection, and deterministic policy enforcement to produce fast, explainable, and audit-ready onboarding decisions.

---

## 2. Problem Statement
Current digital loan onboarding is slow, easy to manipulate, and expensive to review. Static forms capture declared data but miss behavioral credibility, while manual KYC review adds latency and operational cost. Lenders need a system that can evaluate identity, intent, and risk in a single guided interaction.

---

## 3. Goals & Objectives
- Reduce onboarding decision turnaround from hours to minutes.
- Detect fraud and misrepresentation during the session, not after disbursal.
- Improve applicant completion and conversion through conversational UX.
- Enforce KYC, consent, and audit traceability for regulatory readiness.
- Generate explainable outcomes with reason codes and trust timelines.

---

## 4. Target Users
- **Primary:** NBFC lending, digital underwriting, and risk teams.
- **Secondary:** Compliance, KYC operations, fraud operations, internal audit.
- **End User:** Loan applicants across mobile and web channels.

---

## 5. Core Capability Stack
### 5.1 Cognitive Interview Engine
- Adaptive interview flow with dynamic follow-up questions.
- Clarification loops for low-confidence or ambiguous responses.
- Structured extraction of income, employment, intent, and obligations.

### 5.2 Behavioral Trust Engine
- Converts conversational and delivery signals into a normalized trust profile.
- Emits Trust Score (0–100), confidence band, and anomaly flags.
- Generates explainable factor-wise breakdown for reviewer visibility.

### 5.3 Compliance & KYC Layer
- Consent capture with timestamped transcript anchors.
- Face presence, liveness, and age-likelihood signals.
- Immutable audit record for replay and regulator traceability.

### 5.4 Risk + Policy Engine
- AI-assisted fraud and risk intelligence.
- Deterministic policy rules as final decision gate.
- Offer generation only for policy-compliant and eligible applicants.

### 5.5 Multi-Agent Orchestration
- Interview Agent
- Understanding Agent
- Behavioral Trust Agent
- Fraud Detection Agent
- Risk Scoring Agent
- Offer Agent

### 5.6 Intent & Emotion Detection Layer
- Detects **loan intent category**: education, emergency, lifestyle, business.
- Estimates **urgency level** (low / medium / high) from linguistic and temporal patterns.
- Identifies **financial stress signals** from tone variability, uncertainty markers, and instability in repayment narrative.
- Infers **repayment mindset indicators** (disciplined / uncertain / risky) from commitment language and response structure.
- Fuses keyword, semantic, response-structure, and acoustic confidence signals to produce:
  - **Intent Category**
  - **Urgency Score (0–100)**
  - **Financial Stability Indicator (Stable / Watch / Fragile)**
- Feeds Risk + Policy and Offer engines for decision calibration and personalization.

### 5.7 Smart Loan Offer Engine (Dynamic)
- Personalizes loan amount using **risk score + trust score + intent type**.
- Adjusts EMI and tenure by **repayment capacity** and **behavioral confidence**.
- Supports offer profiles:
  - **Aggressive:** low risk, high trust, stable repayment mindset.
  - **Balanced:** moderate risk or mixed confidence indicators.
  - **Conservative:** higher risk, stress-heavy signals, guarded exposure.
- Emits explainable offer rationale with limit, tenure, EMI, and risk controls for compliance traceability.

### 5.8 Real-Time UI Intelligence Layer
- Streams live onboarding intelligence to frontend:
  - **Live Trust Score meter**
  - **Fraud alert banners**
  - **Confidence indicator**
  - **Consent/KYC status indicators**
- Uses event-driven updates from backend intelligence bus to keep applicant and operator views synchronized.
- Improves transparency, reduces drop-off anxiety, and supports guided remediation when issues are detected.

---

## 6. Behavioral Trust Scoring Framework
### 6.1 Trust Score Formula
**Trust Score (0–100)** =
- **0.30 × Response Consistency**
- **+ 0.20 × Voice Confidence**
- **+ 0.20 × Behavioral Stability**
- **+ 0.20 × (100 − Fraud Signals)**
- **+ 0.10 × Profile Completeness**

### 6.2 Factor Definitions
- **Response Consistency (0–100):** Measures alignment of current answers with earlier statements (income, employer, tenure, purpose).
- **Voice Confidence (0–100):** Measures vocal certainty from speech rate stability, filler-word density, and abrupt tone shifts.
- **Behavioral Stability (0–100):** Measures temporal steadiness of response patterns across the interview (sudden stress spikes reduce score).
- **Fraud Signals (0–100, inverse contribution):** Aggregates anomalies from device/IP mismatch, spoof suspicion, identity mismatch, and semantic contradictions.
- **Profile Completeness (0–100):** Measures required-field coverage and evidence sufficiency for underwriting.

### 6.3 Behavioral Intelligence Logic
- **Hesitation Detection:** Calculated from pause duration before answers, repeated restarts, and elevated filler tokens (for example: “uh”, “um”), normalized by question complexity.
- **Contradiction Detection:** The understanding layer converts responses into structured claims (entity, value, timestamp) and runs pairwise consistency checks against prior claims and submitted profile data.
- **Confidence Inference:** Derived from combined acoustic confidence (pace, pitch stability, articulation), response directness, and semantic certainty markers; low confidence is flagged when multiple weak signals co-occur.

---

## 7. Human vs AI Decision Boundary
- **AI role:** AI agents assist with understanding, behavioral interpretation, fraud indicators, and risk signals.
- **Final authority:** Deterministic policy rules execute hard compliance and eligibility checks.
- **Control principle:** If AI confidence is low or signals conflict, system routes to manual review rather than auto-approval.
- **Regulatory assurance:** Every final outcome is tied to policy version, rule IDs, reason codes, and traceable evidence.

---

## 8. Edge Case Handling & Fail-Safes
- **Poor network/audio quality:** Trigger quality gate, request repeat answer, switch to fallback question mode, and mark confidence downgrade.
- **No face detected:** Pause decision pipeline, prompt camera correction, retry bounded times, then route to assisted/manual verification.
- **Inconsistent answers:** Launch adaptive clarifying questions; unresolved contradiction increases fraud/risk and can force manual review.
- **High fraud score:** Enforce automatic step-up checks or hard reject based on configured threshold and policy rules.
- **Low-confidence cases:** Limit autonomous decisioning; require additional evidence or human adjudication before final disposition.

---

## 9. End-to-End Operational Flow
1. Applicant opens secure onboarding session link.
2. Consent and permissions are captured before processing.
3. Live AI interview collects audio, video, and response data.
4. AI stack extracts transcript, semantic, behavioral, intent, emotion/stress, and vision signals in real time.
5. Intent & Emotion Detection Layer emits Intent Category, Urgency Score, and Financial Stability Indicator.
6. Behavioral + semantic fusion composes trust, fraud, and risk-ready features.
7. Risk and policy engines generate scored intelligence and enforce deterministic guardrails.
8. Smart Offer Engine generates dynamic aggressive/balanced/conservative offers for eligible users.
9. Real-Time UI Intelligence Layer streams trust/confidence/fraud/KYC status updates to frontend during session.
10. Deterministic policy applies final approve/reject/manual-review decision with reason codes.
11. Audit layer stores complete decision trace, policy references, and artifacts.

---

## 10. Functional Requirements
- **FR-01:** Tokenized secure session initiation and expiry control.
- **FR-02:** Real-time media ingestion with latency-safe buffering.
- **FR-03:** Streaming STT with timestamped transcript persistence.
- **FR-04:** Explicit verbal consent capture and validation.
- **FR-05:** Face/liveness/age signal extraction pipeline.
- **FR-06:** Structured profile extraction from conversation.
- **FR-07:** Behavioral trust scoring with explainable factor breakdown.
- **FR-08:** Intent detection from language patterns, semantic cues, and response structure.
- **FR-09:** Emotion/stress inference from tone, hesitation, and uncertainty markers.
- **FR-10:** Intent-Emotion output generation: Intent Category, Urgency Score, Financial Stability Indicator.
- **FR-11:** Fraud scoring using multimodal anomaly indicators.
- **FR-12:** Risk scoring that incorporates trust, fraud, and intent-emotion outputs.
- **FR-13:** Deterministic policy execution with explainable reason codes.
- **FR-14:** Dynamic offer personalization (amount, EMI, tenure, offer type) for eligible users.
- **FR-15:** Real-time UI telemetry channel for Trust Score, confidence, fraud alerts, and consent/KYC status.
- **FR-16:** Human-readable decision explanation and trust timeline.
- **FR-17:** Immutable audit package storage and retrieval.

---

## 11. Non-Functional Requirements
- **Latency:** Insight updates in near real time; final decision target under 120 seconds.
- **Availability:** 99.9% service uptime target.
- **Scalability:** Horizontal concurrency for peak campaign spikes.
- **Security:** Encryption in transit/at rest, RBAC, PII minimization and masking.
- **Compliance:** Consent traceability, replayable decision evidence, immutable logs.
- **Observability:** Event tracing, model/version lineage, policy version capture.

---

## 12. System Architecture (Logical)
1. **Experience Layer (Web/Mobile UI):** video call interface, live intelligence widgets, decision and reason-code display.
2. **Orchestration Layer:** session manager, interview state machine, multi-agent coordinator.
3. **AI Intelligence Layer:** STT/NLP, Behavioral Trust, Intent & Emotion Detection, Fraud analytics, Risk scoring.
4. **Decision & Offer Layer:** deterministic policy engine + Smart Loan Offer Engine for profile-specific proposals.
5. **Compliance & Audit Layer:** consent validator, KYC status service, immutable audit/timeline storage.
6. **Streaming/Event Layer:** publishes real-time trust/fraud/confidence/KYC events to frontend.
7. **Model Runtime Layer (NVIDIA):** Riva, NeMo, DeepStream, Triton for real-time inference.

---

## 13. Success Metrics
- Onboarding completion rate uplift
- Decision turnaround time reduction
- Fraud catch rate and false-positive control
- Manual review rate reduction
- Offer acceptance rate
- Compliance evidence completeness
- Audit retrieval SLA adherence
- Intent classification confidence and stability
- Offer suitability performance (acceptance vs delinquency mix)
- Real-time UI transparency impact on abandonment reduction

---

## 14. System Flowcharts (Mermaid)

### 14.1 End-to-End System Flow
```mermaid
flowchart TD
    U[User Opens Secure Link] --> V[Video Session Initialization]
    V --> C{Consent Captured?}
    C -- No --> C1[Prompt Consent Again]
    C1 --> C
    C -- Yes --> D[Data Capture: Audio, Video, Metadata]
    D --> A[AI Processing Pipeline]
    A --> IE[Intent & Emotion Analysis]
    IE --> RF[Risk + Fraud Evaluation]
    RF --> P{Policy Compliant?}
    P -- No --> O1[Reject / Manual Review]
    P -- Yes --> SO[Smart Offer Engine]
    SO --> OT{Offer Type}
    OT -- Aggressive --> O2[High Limit / Flexible Tenure]
    OT -- Balanced --> O3[Moderate Limit / Standard Tenure]
    OT -- Conservative --> O4[Guarded Limit / Tight Tenure]
    O2 --> UI[UI Feedback Layer: Live Trust + Alerts + KYC Status]
    O3 --> UI
    O4 --> UI
    O1 --> UI
    UI --> L[Audit Logs Storage]
    L --> T[Trust Timeline & Explainability]
```

### 14.2 AI Processing Pipeline
```mermaid
flowchart TD
    A1[Audio Stream] --> A2[STT - NVIDIA Riva]
    A2 --> A3[NLP / Entity Understanding - NeMo]
    A3 --> I1[Intent Detection]
    A3 --> E1[Emotion / Stress Analysis]
    I1 --> F1[Behavioral + Semantic Fusion]
    E1 --> F1
    A3 --> A4[Behavioral Analysis]
    A4 --> F1

    V1[Video Stream] --> V2[Face Detection - DeepStream]
    V2 --> V3[Age/Liveness Estimation]
    V3 --> V4[Fraud Signal Extraction]
    V4 --> F1
    F1 --> OI[Outputs: Intent Category, Urgency Score, Financial Stability Indicator]
    OI --> A6[Risk & Decision Engine Input]
```

### 14.3 Decision Engine Flow
```mermaid
flowchart TD
    I[Input Signals: Profile + Behavioral + KYC + Metadata] --> T1[Trust Score]
    I --> I2[Intent Score]
    I --> R0[Risk Score]
    T1 --> F{Fraud Check Passed?}
    I2 --> F
    R0 --> F
    F -- No --> R1[Reject / Step-Up Verification]
    F -- Yes --> C1[Combined Decision Index: Trust + Intent + Risk]
    C1 --> P{Policy Check Passed?}
    P -- No --> R2[Reject / Manual Review]
    P -- Yes --> G[Smart Offer Personalization]
    G --> OType{Offer Type}
    OType -- Aggressive --> A1[Aggressive Offer]
    OType -- Balanced --> A2[Balanced Offer]
    OType -- Conservative --> A3[Conservative Offer]
    A1 --> O[Decision Output + Reason Codes]
    A2 --> O
    A3 --> O
    R1 --> O
    R2 --> O
```

### 14.4 Compliance Flow
```mermaid
flowchart TD
    C1[Consent Capture] --> C2[Transcript Creation]
    C2 --> C3{Consent Phrase Valid?}
    C3 -- No --> C4[Re-capture Consent]
    C4 --> C2
    C3 -- Yes --> C5[Compliance Validation]
    C5 --> C6[Audit Storage]
    C6 --> C7[Traceability: Rule IDs + Timestamps + Evidence]
```

### 14.5 Frontend UI Intelligence Flow
```mermaid
flowchart TD
    U1[Video Call Starts] --> U2[Live Metrics Stream]
    U2 --> U3[Trust Score Meter]
    U2 --> U4[Confidence Indicator]
    U2 --> U5[Consent/KYC Status]
    U2 --> U6{Fraud Alert Triggered?}
    U6 -- Yes --> U7[Show Real-Time Fraud Alert + Guidance]
    U6 -- No --> U8[Continue Guided Interview]
    U7 --> U9{Policy Requires Step-Up?}
    U9 -- Yes --> U10[Prompt Additional Verification]
    U9 -- No --> U8
    U8 --> U11[Final Decision Display]
    U10 --> U11
    U11 --> U12[Reason Codes + Trust Timeline Snapshot]
```

---

## 15. API Surface (Indicative)
| Endpoint | Purpose |
|---|---|
| `POST /api/v1/sessions/init` | Start secure onboarding session |
| `POST /api/v1/sessions/{id}/start` | Begin controlled interview session |
| `POST /api/v1/stream/audio` | Ingest audio chunks for STT/behavior |
| `POST /api/v1/stream/video` | Ingest video frames for vision/fraud |
| `POST /api/v1/consent/capture` | Record and validate consent |
| `POST /api/v1/profile/extract` | Build structured applicant profile |
| `POST /api/v1/fraud/evaluate` | Compute fraud score and flags |
| `POST /api/v1/risk/evaluate` | Compute risk score and eligibility |
| `POST /api/v1/intent-emotion/evaluate` | Compute intent category, urgency, and financial stability indicators |
| `POST /api/v1/decision/generate` | Execute deterministic final decision |
| `POST /api/v1/offers/generate` | Generate offer options for approved users |
| `GET /api/v1/sessions/{id}/ui-stream` | Stream live trust/fraud/confidence/KYC state to frontend |
| `POST /api/v1/audit/store` | Persist immutable audit package |
| `GET /api/v1/sessions/{id}/timeline` | Fetch trust and compliance timeline |

---

## 16. Hackathon Differentiation
- Real-time behavioral trust scoring fused with fraud and risk intelligence.
- Strong AI depth with multimodal processing (speech + NLP + vision).
- Intent and emotion-aware underwriting context for better suitability decisions.
- Dynamic smart offers that balance conversion and default-risk control in real time.
- Transparent UI intelligence layer that builds applicant trust during onboarding.
- Explicit AI-to-policy boundary aligned with fintech regulation.
- Explainable trust timeline for judges, risk teams, and auditors.
- Deployable architecture with clear path from mock integrations to production services.
