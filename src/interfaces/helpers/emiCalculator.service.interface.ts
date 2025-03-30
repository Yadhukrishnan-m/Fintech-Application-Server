

export interface IEmiCalculator {
  calculateEmi(
    principal: number,
    annualInterestRate: number,
    tenure: number
  ): {
    emi: number;
    monthlyInterest: number;
    principalPerMonth: number;
  };
  calculatePenalty(
    emi: number,
    annualPenaltyRate: number,
    gracePeriodEndDate: Date,
    today: Date
  ): number;
}
