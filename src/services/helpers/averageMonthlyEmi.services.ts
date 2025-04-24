
import { IUserLoanRepository } from "../../interfaces/repositories/user-loan.repository.interface";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IEmiCalculator } from "../../interfaces/helpers/emiCalculator.service.interface";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { today } from "../../config/testDate";
import { ITransaction } from "../../models/transaction.model";
import { CustomError } from "../../utils/custom-error";
import cron from "node-cron";
import { IEmailService } from "../../interfaces/helpers/email-service.service.interface";
import { IAverageMontlyEmi } from "../../interfaces/helpers/averageMontlyEmi.service.interface";
@injectable()
export class AverageMontlyEmi implements IAverageMontlyEmi {
  constructor(
    @inject(TYPES.UserLoanRepository)
    private _userLoanRepository: IUserLoanRepository,
    @inject(TYPES.EmiCalculator)
    private _emiCalculator: IEmiCalculator
  ) {}
  async findAverageEmi(userId: string): Promise<number> {
    const userLoans = await this._userLoanRepository.getRunningLoans(userId);

    if (!userLoans || userLoans.length === 0) {
      return 0;
    }

    let totalMonthlyEmi = 0;

    for (const loan of userLoans) {
      const { amount, interest, tenure } = loan;

      const { emi } = this._emiCalculator.calculateEmi(
        amount,
        interest, 
        tenure 
      );

      totalMonthlyEmi += emi;
    }

    return Number(totalMonthlyEmi.toFixed(2)); 
  }
}
 