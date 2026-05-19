export class IntentEmotionEngine {
  public evaluate(transcriptChunk: string) {
    // In production, NeMo NLP models run here.
    // Mock logic based on keywords
    const lower = transcriptChunk.toLowerCase();
    
    let intentCategory = 'Personal';
    let urgencyScore = 30;
    let stability = 'Stable';

    if (lower.includes('business') || lower.includes('inventory')) {
      intentCategory = 'Business Expansion';
    } else if (lower.includes('medical') || lower.includes('hospital') || lower.includes('emergency')) {
      intentCategory = 'Emergency/Medical';
      urgencyScore = 85;
      stability = 'Fragile';
    } else if (lower.includes('education') || lower.includes('school')) {
      intentCategory = 'Education';
    }

    // Emotion proxy
    const hesitationTokens = (lower.match(/\b(um|uh|like|maybe|i don't know)\b/g) || []).length;
    let emotion = 'Confident';
    if (hesitationTokens > 2) {
      emotion = 'Hesitant / Stressed';
      stability = 'Watch';
    }

    return {
      intentCategory,
      urgencyScore,
      financialStability: stability,
      dominantEmotion: emotion
    };
  }
}
