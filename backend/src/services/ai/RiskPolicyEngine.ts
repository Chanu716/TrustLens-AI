import { FraudResult } from './FraudDetectionEngine';

export type DecisionStatus = 'approved' | 'rejected' | 'manual_review';

export interface PolicyDecision {
  status: DecisionStatus;
  riskScore: number;
  reasonCodes: string[];
  eligibleForOffer: boolean;
}

export class RiskPolicyEngine {
  evaluate(
    trustScore: number,
    fraudResult: FraudResult,
    intentStability: string
  ): PolicyDecision {
    const reasonCodes: string[] = [];
    let riskScore = 0;

    // Weighted risk formula (mock)
    // 40% weight on inverse trust, 40% on fraud, 20% on stability
    const trustRisk = (100 - trustScore) * 0.40;
    const fraudRisk = fraudResult.fraudScore * 0.40;
    const stabilityRisk = intentStability === 'Fragile' ? 20 : intentStability === 'Watch' ? 10 : 0;

    riskScore = Math.round(Math.min(trustRisk + fraudRisk + stabilityRisk, 100));

    // Deterministic policy rules
    let status: DecisionStatus;

    if (fraudResult.riskLevel === 'high') {
      status = 'rejected';
      reasonCodes.push('FR-01: High fraud risk score detected');
      reasonCodes.push('FR-02: ' + (fraudResult.flags[0] ?? 'Critical fraud signal triggered'));
    } else if (riskScore >= 65) {
      status = 'manual_review';
      reasonCodes.push('POL-01: Combined risk score exceeds manual review threshold');
    } else if (trustScore < 35) {
      status = 'manual_review';
      reasonCodes.push('POL-02: Trust score below minimum autonomous approval threshold');
    } else {
      status = 'approved';
      reasonCodes.push('POL-10: All policy checks passed');
      if (trustScore > 75) reasonCodes.push('POL-11: High behavioral trust score — eligible for preferential offer');
    }

    return {
      status,
      riskScore,
      reasonCodes,
      eligibleForOffer: status === 'approved',
    };
  }
}
