import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { TrustEngine } from '../services/ai/TrustEngine';
import { InterviewAgent } from '../services/ai/InterviewAgent';
import { IntentEmotionEngine } from '../services/ai/IntentEmotionEngine';
import { FraudDetectionEngine } from '../services/ai/FraudDetectionEngine';
import { RiskPolicyEngine } from '../services/ai/RiskPolicyEngine';
import { SmartOfferEngine } from '../services/ai/SmartOfferEngine';

let io: SocketIOServer;

// Map session IDs to their active AI engines, intervals, and accumulated state
const sessionEngines = new Map<string, {
  trustEngine: TrustEngine;
  interviewAgent: InterviewAgent;
  intentEngine: IntentEmotionEngine;
  lastIntentData: { intentCategory: string; urgencyScore: number; financialStability: string };
  decisionFired: boolean;
  interval?: NodeJS.Timeout;
}>();

// Stores a per-session loanAmount for offer engine
const sessionMeta = new Map<string, { loanAmount: number }>();

export const initSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join session room for targeted event delivery
    socket.on('session:join', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      console.log(`📡 Socket ${socket.id} joined session room: ${sessionId}`);
      socket.emit('session:joined', { sessionId, socketId: socket.id });

      // Initialize AI engines if they don't exist for this session
      if (!sessionEngines.has(sessionId)) {
        sessionEngines.set(sessionId, {
          trustEngine: new TrustEngine(),
          interviewAgent: new InterviewAgent(),
          intentEngine: new IntentEmotionEngine(),
          lastIntentData: { intentCategory: 'Personal', urgencyScore: 30, financialStability: 'Stable' },
          decisionFired: false,
        });
      }
    });

    // Start session AI processing loop
    socket.on('session:start_ai', (data: string | { sessionId: string; loanAmount?: number }) => {
      const sessionId = typeof data === 'string' ? data : data.sessionId;
      const loanAmount = typeof data === 'object' ? (data.loanAmount ?? 50000) : 50000;
      const engines = sessionEngines.get(sessionId);
      if (!engines) return;

      // Store metadata for decision engines
      sessionMeta.set(sessionId, { loanAmount });
      engines.interviewAgent.start();
      engines.decisionFired = false;

      // Start broadcasting telemetry
      if (engines.interval) clearInterval(engines.interval);

      // Emit timeline event: session started
      io.to(`session:${sessionId}`).emit('ai:timeline_event', {
        type: 'session_started', label: 'AI Session Initiated', timestamp: new Date().toISOString()
      });

      engines.interval = setInterval(() => {
        // Broadcast Trust Score
        const trust = engines.trustEngine.getLiveTrust();
        io.to(`session:${sessionId}`).emit('ai:trust_update', trust);

        // Push next question periodically
        if (Math.random() > 0.6) {
          const nextQ = engines.interviewAgent.getNextQuestion();
          if (nextQ) {
            io.to(`session:${sessionId}`).emit('ai:interview_question', { text: nextQ });
            io.to(`session:${sessionId}`).emit('ai:timeline_event', {
              type: 'question_asked', label: 'AI asked a question', timestamp: new Date().toISOString()
            });
          }
        }

        // When interview is complete, fire the decision pipeline once
        if (engines.interviewAgent.isComplete() && !engines.decisionFired) {
          engines.decisionFired = true;
          if (engines.interval) clearInterval(engines.interval);

          io.to(`session:${sessionId}`).emit('ai:interview_complete', {
            message: 'Interview concluded. Processing final decision...'
          });

          // Allow a brief delay for UX, then run decision engines
          setTimeout(() => {
            const finalTrust = engines.trustEngine.getLiveTrust();
            const intentData = engines.lastIntentData;
            const meta = sessionMeta.get(sessionId) ?? { loanAmount: 50000 };

            // Fraud → Risk → Offer pipeline
            const fraudEngine = new FraudDetectionEngine();
            const riskEngine = new RiskPolicyEngine();
            const offerEngine = new SmartOfferEngine();

            const fraudResult = fraudEngine.evaluate(finalTrust.score, {
              urgency: intentData.urgencyScore,
              stability: intentData.financialStability,
            });

            io.to(`session:${sessionId}`).emit('ai:timeline_event', {
              type: 'fraud_evaluated', label: `Fraud Check — Risk: ${fraudResult.riskLevel.toUpperCase()}`,
              timestamp: new Date().toISOString(), detail: fraudResult.flags.join(', ') || 'No flags'
            });

            const policyDecision = riskEngine.evaluate(
              finalTrust.score, fraudResult, intentData.financialStability
            );

            io.to(`session:${sessionId}`).emit('ai:timeline_event', {
              type: 'policy_evaluated', label: `Policy Engine — ${policyDecision.status.replace('_', ' ').toUpperCase()}`,
              timestamp: new Date().toISOString(), detail: policyDecision.reasonCodes.join(' | ')
            });

            let offer = null;
            if (policyDecision.eligibleForOffer) {
              offer = offerEngine.generate(
                meta.loanAmount, finalTrust.score, policyDecision.riskScore, intentData.intentCategory
              );
              io.to(`session:${sessionId}`).emit('ai:timeline_event', {
                type: 'offer_generated', label: `Smart Offer — ${offer.profile.toUpperCase()} Profile`,
                timestamp: new Date().toISOString(), detail: `₹${offer.approvedAmount.toLocaleString('en-IN')} @ ${offer.interestRate}%`
              });
            }

            // Emit final decision to frontend
            io.to(`session:${sessionId}`).emit('session:complete', {
              trustScore: finalTrust.score,
              fraudResult,
              policyDecision,
              offer,
              timestamp: new Date().toISOString(),
            });

            console.log(`✅ Decision fired for session: ${sessionId} — ${policyDecision.status}`);
          }, 2500);
        }
      }, 3000);

      console.log(`🤖 AI Processing started for session: ${sessionId}`);
    });

    // Receive audio chunk from client
    socket.on('audio:chunk', (data: { sessionId: string; chunkData: any; chunkLength: number }) => {
      const engines = sessionEngines.get(data.sessionId);
      if (engines) {
        // Feed audio presence to trust engine to fluctuate score
        engines.trustEngine.processAudioChunk(data.chunkLength || 1024);

        // Mock STT: Emit a fake transcript piece back based on Intent Engine
        if (Math.random() > 0.8) {
          const mockTranscript = 'I need this loan for an emergency medical expense.';
          const intentData = engines.intentEngine.evaluate(mockTranscript);
          // Persist latest intent data for the decision pipeline
          engines.lastIntentData = intentData;
          io.to(`session:${data.sessionId}`).emit('ai:intent_update', intentData);
          io.to(`session:${data.sessionId}`).emit('ai:transcript', { text: mockTranscript });
        }
      }
    });

    // Leave session room
    socket.on('session:leave', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
      console.log(`📡 Socket ${socket.id} left session room: ${sessionId}`);
      const engines = sessionEngines.get(sessionId);
      if (engines && engines.interval) {
        clearInterval(engines.interval);
        sessionEngines.delete(sessionId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} — reason: ${reason}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

export const emitToSession = (
  sessionId: string,
  event: string,
  data: unknown
): void => {
  if (io) {
    io.to(`session:${sessionId}`).emit(event, data);
  }
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
