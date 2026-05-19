import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrustLens AI — Real-Time AI Video Onboarding for Digital Lending',
  description:
    'TrustLens AI is a compliance-first onboarding platform that evaluates what applicants say, how they behave, and whether their signals are trustworthy — producing fast, explainable lending decisions.',
  keywords: [
    'AI onboarding',
    'digital lending',
    'behavioral trust scoring',
    'KYC',
    'fraud detection',
    'fintech',
  ],
  authors: [{ name: 'TrustLens AI' }],
  openGraph: {
    title: 'TrustLens AI',
    description: 'Trust at First Conversation',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
