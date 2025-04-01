import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import { IEmiCalculator } from "../../interfaces/helpers/emiCalculator.service.interface";

@injectable()
export class EmiCalculator implements IEmiCalculator {
  calculateEmi(
    principal: number,
    annualInterestRate: number,
    tenure: number
  ): {
    emi: number;
    monthlyInterest: number;
    principalPerMonth: number;
  } {
    const monthlyInterestRate = annualInterestRate / 12 / 100;
    let emi: number = 0;
    if (monthlyInterestRate === 0) {
      emi = principal / tenure;
    }
    emi = parseFloat(
      (
        (principal *
          monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, tenure)) /
        (Math.pow(1 + monthlyInterestRate, tenure) - 1)
      ).toFixed(2)
    );
    const monthlyInterest = parseFloat(
      (principal * monthlyInterestRate).toFixed(2)
    );

    const principalPerMonth = parseFloat((emi - monthlyInterest).toFixed(2));

    return {
      emi,
      monthlyInterest,
      principalPerMonth,
    };
  }


   calculatePenalty(
  emi: number,
  annualPenaltyRate: number,
  gracePeriodEndDate: Date,
  today: Date
): number {
  const msPerDay = 24 * 60 * 60 * 1000;
 
  const daysLate = Math.max(
    0,
    Math.floor((today.getTime() - gracePeriodEndDate.getTime()) / msPerDay)+1
  );
  const dailyPenaltyRate = annualPenaltyRate / 100 / 365;
  const totalPenalty = emi * dailyPenaltyRate * daysLate;
  return parseFloat(totalPenalty.toFixed(2));
}


}
