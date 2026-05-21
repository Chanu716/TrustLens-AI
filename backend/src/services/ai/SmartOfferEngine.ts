export type OfferProfile = 'aggressive' | 'balanced' | 'conservative';

export interface LoanOffer {
  profile: OfferProfile;
  approvedAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiEstimate: number;
  rationale: string;
}

export class SmartOfferEngine {
  generate(
    requestedAmount: number,
    trustScore: number,
    riskScore: number,
    intentCategory: string
  ): LoanOffer {
    let profile: OfferProfile;
    let approvalRatio: number;
    let interestRate: number;
    let tenureMonths: number;

    // Determine offer profile based on combined signals
    if (trustScore >= 70 && riskScore <= 35) {
      profile = 'aggressive';
      approvalRatio = 1.0;      // 100% of requested amount
      interestRate = 11.5;
      tenureMonths = 48;
    } else if (trustScore >= 50 && riskScore <= 60) {
      profile = 'balanced';
      approvalRatio = 0.80;     // 80% of requested amount
      interestRate = 14.0;
      tenureMonths = 36;
    } else {
      profile = 'conservative';
      approvalRatio = 0.60;     // 60% of requested amount
      interestRate = 17.5;
      tenureMonths = 24;
    }

    // Intent-based small boost for education/business
    if (intentCategory === 'Education' || intentCategory === 'Business Expansion') {
      approvalRatio = Math.min(approvalRatio + 0.05, 1.0);
    }

    const approvedAmount = Math.round(requestedAmount * approvalRatio);
    const monthlyRate = interestRate / 100 / 12;
    const emiEstimate = Math.round(
      (approvedAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );

    const rationale = profile === 'aggressive'
      ? 'High trust and low risk profile — full loan amount approved at preferential rate.'
      : profile === 'balanced'
      ? 'Moderate risk indicators — partial approval with standard terms.'
      : 'Elevated risk signals — conservative offer with guarded exposure.';

    return { profile, approvedAmount, interestRate, tenureMonths, emiEstimate, rationale };
  }
}
