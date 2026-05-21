'use client';

import React from 'react';
import styles from './TrustTimeline.module.css';

export interface TimelineEvent {
  type: string;
  label: string;
  timestamp: string;
  detail?: string;
}

const iconMap: Record<string, string> = {
  session_started: '🚀',
  question_asked: '🎙️',
  fraud_evaluated: '🛡️',
  policy_evaluated: '⚖️',
  offer_generated: '💡',
  default: '📌',
};

interface TrustTimelineProps {
  events: TimelineEvent[];
}

export default function TrustTimeline({ events }: TrustTimelineProps) {
  return (
    <div className={styles.timeline}>
      <h3 className={styles.title}>Trust Timeline</h3>
      <p className={styles.subtitle}>A transparent, event-by-event record of your session</p>
      <div className={styles.events}>
        {events.map((event, index) => (
          <div key={index} className={styles.event}>
            <div className={styles.iconCol}>
              <div className={styles.icon}>{iconMap[event.type] ?? iconMap.default}</div>
              {index < events.length - 1 && <div className={styles.connector} />}
            </div>
            <div className={styles.content}>
              <p className={styles.label}>{event.label}</p>
              {event.detail && <p className={styles.detail}>{event.detail}</p>}
              <p className={styles.timestamp}>
                {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
