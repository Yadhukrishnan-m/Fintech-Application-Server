import { injectable } from "inversify";
@injectable()
export class InterestCalculator {
  constructor() {}

  calculateInterest(
    cibilScore: number,
    minInterest: number,
    maxInterest: number
  ):number {
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
}
