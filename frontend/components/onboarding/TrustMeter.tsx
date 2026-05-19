'use client';

import React, { useEffect, useRef } from 'react';
import styles from './TrustMeter.module.css';

interface TrustMeterProps {
  score?: number;
  analyzing?: boolean;
  label?: string;
}

export default function TrustMeter({
  score = 0,
  analyzing = true,
  label = 'Trust Score',
}: TrustMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getColor = (s: number) => {
    if (s >= 70) return '#00ff9d';
    if (s >= 40) return '#ffb830';
    return '#ff4d6d';
  };

  const getLabel = (s: number) => {
    if (s >= 70) return 'HIGH TRUST';
    if (s >= 40) return 'MODERATE';
    return 'LOW TRUST';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 160;
    canvas.width = size;
    canvas.height = size;

    const cx = size / 2;
    const cy = size / 2;
    const r = 60;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const color = getColor(score);
    const progress = score / 100;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (!analyzing) {
      // Filled arc
      const fillEnd = startAngle + (endAngle - startAngle) * progress;
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#00c8ff');
      gradient.addColorStop(1, color);

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, fillEnd);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow effect
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, fillEnd);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.3;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Score text
    ctx.font = '700 28px Syne, sans-serif';
    ctx.fillStyle = analyzing ? 'rgba(255,255,255,0.3)' : '#f0f2ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(analyzing ? '--' : String(score), cx, cy - 6);

    // Sub label
    ctx.font = '500 9px Inter, sans-serif';
    ctx.fillStyle = analyzing ? 'rgba(255,255,255,0.2)' : getColor(score);
    ctx.letterSpacing = '0.1em';
    ctx.fillText(analyzing ? 'ANALYZING...' : getLabel(score), cx, cy + 16);
  }, [score, analyzing]);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.label}>{label}</p>
    </div>
  );
}
