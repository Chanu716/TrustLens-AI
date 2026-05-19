export class InterviewAgent {
  private questions = [
    "Hi there! To start, could you state your full name and the loan amount you are requesting?",
    "Thank you. Could you briefly explain what you plan to use this loan for?",
    "I see. How long have you been at your current job, and what is your monthly income?",
    "Almost done. Have you had any major unexpected expenses in the last 6 months?",
    "Great, that's all I need! Our AI agents are finalizing your assessment now."
  ];
  private currentIndex = 0;
  private active = false;

  public start() {
    this.active = true;
    this.currentIndex = 0;
  }

  public getNextQuestion(): string | null {
    if (!this.active || this.currentIndex >= this.questions.length) return null;
    const q = this.questions[this.currentIndex];
    this.currentIndex++;
    return q;
  }

  public isComplete(): boolean {
    return this.currentIndex >= this.questions.length;
  }
}
