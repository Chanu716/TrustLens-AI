export interface FraudResult {
  fraudScore: number;
  flags: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export class FraudDetectionEngine {
  // Simulates multi-modal fraud analysis based on session signals
  evaluate(trustScore: number, intentData: { urgency?: number; stability?: string }): FraudResult {
    const flags: string[] = [];
    let fraudScore = 0;

    // Mock: Low trust is a fraud signal
    if (trustScore < 40) {
      fraudScore += 35;
      flags.push('Low behavioral trust score');
    }

    // Mock: High urgency + fragile stability is a fraud signal
    if ((intentData.urgency ?? 0) > 70 && intentData.stability === 'Fragile') {
      fraudScore += 30;
      flags.push('High urgency with fragile financial stability');
    }

    // Mock: Random minor anomalies to simulate environmental noise
    const deviceAnomaly = Math.random() > 0.75;
    if (deviceAnomaly) {
      fraudScore += 15;
      flags.push('Device/IP metadata inconsistency');
    }

    // Clamp score
    fraudScore = Math.min(fraudScore, 100);

    const riskLevel = fraudScore >= 60 ? 'high' : fraudScore >= 30 ? 'medium' : 'low';

    return { fraudScore, flags, riskLevel };
  }
}
