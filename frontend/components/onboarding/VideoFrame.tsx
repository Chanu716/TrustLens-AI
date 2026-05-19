'use client';

import React, { useRef, useEffect, useState } from 'react';
import { connectSocket } from '@/lib/socket';
import styles from './VideoFrame.module.css';

interface VideoFrameProps {
  sessionId?: string;
  isActive?: boolean;
  onStreamReady?: (stream: MediaStream) => void;
  onStreamError?: (error: Error) => void;
}

type Quality = 'excellent' | 'good' | 'poor' | 'offline';

export default function VideoFrame({ sessionId, isActive, onStreamReady, onStreamError }: VideoFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [quality, setQuality] = useState<Quality>('offline');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Telemetry state
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setQuality('excellent');
        onStreamReady?.(stream);
      } catch (err) {
        if (!mounted) return;
        const error = err as Error;
        setPermissionError(
          error.name === 'NotAllowedError'
            ? 'Camera access denied. Please allow camera and microphone permissions.'
            : 'Unable to access camera. Please check your device.'
        );
        setQuality('offline');
        onStreamError?.(error);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Handle Socket & Audio Streaming
  useEffect(() => {
    if (!isActive || !sessionId || !streamRef.current) return;

    const socket = connectSocket(sessionId);

    // Mock Audio chunking: Every 2 seconds, emit an audio chunk if not muted
    audioIntervalRef.current = setInterval(() => {
      if (!isMuted) {
        socket.emit('audio:chunk', {
          sessionId,
          chunkData: 'mock-audio-buffer-data',
          chunkLength: Math.floor(Math.random() * 500) + 500, // bytes
        });
      }
    }, 2000);

    // Listen for AI responses
    socket.on('ai:interview_question', (data: { text: string }) => {
      setAiQuestion(data.text);
      // Clear transcript when a new question is asked
      setTranscript(null);
    });

    socket.on('ai:transcript', (data: { text: string }) => {
      setTranscript(data.text);
    });

    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isActive, sessionId, isMuted]);

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = isCameraOff;
    });
    setIsCameraOff((prev) => !prev);
  };

  const qualityConfig: Record<Quality, { color: string; label: string }> = {
    excellent: { color: 'var(--color-trust)', label: 'Excellent' },
    good:      { color: 'var(--color-primary)', label: 'Good' },
    poor:      { color: 'var(--color-warn)', label: 'Poor' },
    offline:   { color: 'var(--color-danger)', label: 'Offline' },
  };

  return (
    <div className={styles.frame}>
      {/* Video */}
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`${styles.video} ${isCameraOff ? styles.videoHidden : ''}`}
        />

        {isCameraOff && (
          <div className={styles.cameraOff}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
            <span>Camera Off</span>
          </div>
        )}

        {permissionError && (
          <div className={styles.errorOverlay}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{permissionError}</p>
          </div>
        )}

        {/* Scan overlay when active */}
        {!permissionError && !isCameraOff && isActive && (
          <div className={styles.scanOverlay}>
            <div className={styles.scanLine} />
            <div className={styles.cornerTL} />
            <div className={styles.cornerTR} />
            <div className={styles.cornerBL} />
            <div className={styles.cornerBR} />
          </div>
        )}

        {/* AI Question & Transcript Overlay */}
        {isActive && (aiQuestion || transcript) && (
           <div className={styles.transcriptOverlay}>
             {aiQuestion && (
               <div className={styles.aiQuestion}>
                 <span className={styles.aiAvatar}>🤖</span>
                 <p>{aiQuestion}</p>
               </div>
             )}
             {transcript && (
               <div className={styles.userTranscript}>
                 <p>"{transcript}"</p>
                 <span className={styles.sttLabel}>LIVE STT</span>
               </div>
             )}
           </div>
        )}

        {/* Connection quality */}
        <div className={styles.qualityBadge}>
          <div
            className={styles.qualityDot}
            style={{ background: qualityConfig[quality].color }}
          />
          <span>{qualityConfig[quality].label}</span>
        </div>

        {/* LIVE indicator */}
        {!permissionError && !isCameraOff && isActive && (
          <div className={styles.liveBadge}>
            <div className={styles.liveDot} />
            LIVE
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          id="btn-toggle-mic"
          onClick={toggleMic}
          className={`${styles.controlBtn} ${isMuted ? styles.controlBtnOff : ''}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
          <span>{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button
          id="btn-toggle-camera"
          onClick={toggleCamera}
          className={`${styles.controlBtn} ${isCameraOff ? styles.controlBtnOff : ''}`}
          title={isCameraOff ? 'Turn on Camera' : 'Turn off Camera'}
        >
          {isCameraOff ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="23" y2="23" /><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          )}
          <span>{isCameraOff ? 'Camera On' : 'Camera Off'}</span>
        </button>
      </div>
    </div>
  );
}
