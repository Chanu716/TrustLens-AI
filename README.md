# TrustLens AI
### Regulatory-Grade Agentic Video-Based Loan Onboarding System

TrustLens AI is a real-time, AI-powered onboarding platform for NBFC lending that evaluates not only **what a borrower says**, but also **how they say it** and **whether their responses are consistent and trustworthy**.

---

## Problem
Digital loan journeys today are constrained by:
- form-based data capture that is easy to manipulate
- manual KYC overhead and delays
- weak real-time fraud/context understanding
- high onboarding drop-offs

Lenders need a faster, safer, and compliant onboarding model that can evaluate trust and risk live during customer interaction.

---

## Solution
TrustLens AI replaces static forms with a **video-first, AI-driven lending workflow**:
- adaptive AI interview
- real-time speech and vision intelligence
- behavioral trust scoring
- fraud and policy checks
- instant personalized offer generation
- audit-grade compliance trail

---

## Core Features
- **Cognitive Interview Engine:** adaptive, context-aware questioning
- **Behavioral Trust Engine:** hesitation/confidence/consistency analytics
- **Compliance & KYC Layer:** consent capture, face/liveness, geo checks
- **Risk & Decision Engine:** eligibility, pricing, and EMI logic
- **Multi-Agent Orchestration:** Interview, Understanding, Fraud, Risk, Offer agents
- **Trust Timeline:** explainable sequence of verification and decision events

---

## Architecture Overview
1. User opens a secure campaign link and starts a controlled video session.
2. Frontend streams audio/video while sending geo and session metadata.
3. AI stack processes:
   - STT transcription
   - conversational understanding
   - behavioral signals
   - face/liveness/age signals
4. Fraud + risk + policy engines evaluate eligibility.
5. Offer engine generates amount/tenure/rate/EMI options.
6. Audit service stores transcript, consent, metadata, decisions, and rationale.

> AI augments decision intelligence, while deterministic policy remains the final enforcement layer.

---

## Tech Stack
- **Speech-to-Text:** NVIDIA Riva
- **Conversational AI / LLM:** NVIDIA NeMo
- **Video Processing:** NVIDIA DeepStream
- **Inference Serving:** Triton Inference Server
- **Frontend:** React / Next.js
- **Backend:** Node.js
- **Storage:** MongoDB / Firebase

---

## Demo Flow
1. Customer receives secure onboarding link (SMS/WhatsApp/email).
2. AI loan officer starts a live onboarding interview.
3. System captures consent, responses, video signals, and geo metadata.
4. Behavioral trust and fraud checks run in real time.
5. Risk and policy engines compute final eligibility.
6. Customer receives approval/rejection + personalized offer options.
7. Complete interaction is stored for compliance and audit.

---

## How It Works
- **Capture:** video, audio, geo, session metadata
- **Understand:** STT + NLP to build structured applicant profile
- **Validate:** KYC and consent evidence collection
- **Assess:** behavioral trust + fraud + risk
- **Decide:** deterministic policy + explainable outputs
- **Store:** centralized audit logs for traceability and replay

---

## Why This Is Innovative
- Moves beyond static forms into trust-aware conversational onboarding
- Introduces behavioral intelligence as a lending signal
- Enables real-time AI-assisted decisioning with explainability
- Delivers compliance-first architecture suitable for regulated lending
- Provides trust timeline visualization for users, risk teams, and auditors

---

## AI Components: Real vs Mocked (Hackathon Practicality)
- **Real/Partial:** interview orchestration, transcript structuring, offer generation
- **Mock/Partial:** some behavioral/vision/bureau signals where live integrations are unavailable
- **Architecture-ready:** modules are designed for production-grade replacement with live models/services

---

## Future Scope
- advanced anti-spoofing and liveness checks
- multilingual interview support
- stronger risk model calibration with real bureau connectors
- human-in-the-loop review workflow for edge cases
- continuous monitoring for model bias and drift

---

## Documentation
- Product Requirements Document: [`docs/PRD.md`](docs/PRD.md)

