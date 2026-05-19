import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { TrustEngine } from '../services/ai/TrustEngine';
import { InterviewAgent } from '../services/ai/InterviewAgent';
import { IntentEmotionEngine } from '../services/ai/IntentEmotionEngine';

let io: SocketIOServer;

// Map session IDs to their active AI engines and intervals
const sessionEngines = new Map<string, {
  trustEngine: TrustEngine;
  interviewAgent: InterviewAgent;
  intentEngine: IntentEmotionEngine;
  interval?: NodeJS.Timeout;
}>();

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
        });
      }
    });

    // Start session AI processing loop
    socket.on('session:start_ai', (sessionId: string) => {
      const engines = sessionEngines.get(sessionId);
      if (!engines) return;

      engines.interviewAgent.start();
      
      // Start broadcasting telemetry
      if (engines.interval) clearInterval(engines.interval);
      
      engines.interval = setInterval(() => {
        // Broadcast Trust Score
        io.to(`session:${sessionId}`).emit('ai:trust_update', engines.trustEngine.getLiveTrust());
        
        // Push next question periodically if interview is active
        // Normally this would be driven by STT silence detection
        if (Math.random() > 0.6) {
          const nextQ = engines.interviewAgent.getNextQuestion();
          if (nextQ) {
            io.to(`session:${sessionId}`).emit('ai:interview_question', { text: nextQ });
          } else if (engines.interviewAgent.isComplete()) {
            io.to(`session:${sessionId}`).emit('ai:interview_complete', { message: 'Interview concluded. Processing decision.' });
          }
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
        
        // Mock STT: Emit a fake transcript piece back based on Intent Engine (Just a mock)
        if (Math.random() > 0.8) {
           const mockTranscript = "I need this loan for an emergency medical expense.";
           const intentData = engines.intentEngine.evaluate(mockTranscript);
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
