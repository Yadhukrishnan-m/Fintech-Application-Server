import { injectable } from "inversify";

@injectable()
export class InterestCalculator {
  constructor() {}

  private calculateCibilInterest(
    cibilScore: number,
    minInterest: number,
    maxInterest: number
  ): number {
    if (cibilScore >= 750) {
      return minInterest;
    } else if (cibilScore >= 650) {
      return minInterest + (maxInterest - minInterest) * 0.3;
    } else if (cibilScore >= 550) {
      return minInterest + (maxInterest - minInterest) * 0.6;
    } else {
      return maxInterest;
    }
  }

  private calculateFinScoreInterest(
    finscore: number,
    minInterest: number,
    maxInterest: number
  ): number {
    const interestRange = maxInterest - minInterest;
    const interestOffset = (1 - finscore / 100) * interestRange;
    return Math.round(minInterest + interestOffset);
  }

  calculateInterest(
    cibilScore: number,
    finscore: number,
    minInterest: number,
    maxInterest: number
  ): number {
    const cibilInterest = this.calculateCibilInterest(
      cibilScore,
      minInterest,
      maxInterest
    );
    const finScoreInterest = this.calculateFinScoreInterest(
      finscore,
      minInterest,
      maxInterest
    );


    return Number(Math.min(cibilInterest, finScoreInterest).toFixed(2));
  }
}
