'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="url(#lg)" strokeWidth="2" />
              <circle cx="14" cy="14" r="6" fill="url(#lg2)" opacity="0.8" />
              <circle cx="14" cy="14" r="2" fill="#fff" />
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00c8ff" />
                  <stop offset="1" stopColor="#00ff9d" />
                </linearGradient>
                <linearGradient id="lg2" x1="8" y1="8" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00c8ff" stopOpacity="0.4" />
                  <stop offset="1" stopColor="#00ff9d" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoText}>TrustLens <span className="gradient-text">AI</span></span>
        </Link>

        <div className={styles.actions}>
          <span className={styles.pill}>
            <span className={styles.pillDot} />
            Phase 1 — Foundation
          </span>
          <Link href="/onboarding" className="btn btn-primary" id="nav-start-btn">
            Start Onboarding
          </Link>
        </div>
      </div>
    </nav>
  );
}
