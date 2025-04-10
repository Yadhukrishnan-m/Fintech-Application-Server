import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IUserLoan } from "../../models/user-loan.model";
import { IUserLoanRepository } from "../../interfaces/repositories/user-loan.repository.interface";
import { IUserLoanService } from "../../interfaces/services/user-loan.interface.interfaces";
import { ITransaction } from "../../models/transaction.model";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
import { IEmiCalculator } from "../../interfaces/helpers/emiCalculator.service.interface";
import { IEmi } from "../../dtos/shared/emi.dto";
import { today } from "../../config/testDate";

@injectable()
export class UserLoanService implements IUserLoanService {
  constructor(
    @inject(TYPES.UserLoanRepository)
    private _userLoanRepository: IUserLoanRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmiCalculator) private _emiCalculator: IEmiCalculator,
    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository
  ) {}

  async getUserLoanByUserId(
    userId: string,
    page: number
  ): Promise<{
    userLoan: IUserLoan[];
    totalPages: number;
    currentPage: number;
    totalUserLoans: number;
  }> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const totalUserLoans = await this._userLoanRepository.countDocuments({});
    const totalPages = Math.ceil(totalUserLoans / pageSize);
    const userLoans = await this._userLoanRepository.getUserLoanByuserId(
      { createdAt: -1 },
      skip,
      pageSize,
      userId
    );
    return {
      userLoan: userLoans || [],
      totalPages,
      currentPage: page,
      totalUserLoans,
    };
  }
    async getEmis(
      userLoanId: string,
      userId:string
    ): Promise<{ emiSchedule: IEmi[]; userLoan: IUserLoan }> {
      const userLoan: IUserLoan | null = await this._userLoanRepository.findById(
        userLoanId
      );
      if (!userLoan) {
        throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }
      if (userLoan.userId.toString()!==userId) {
        throw new CustomError(MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
      }

      const transactions: ITransaction[] | null =
        await this._transactionRepository.getUserLoanTransactions(userLoanId);
      const principalAmount = userLoan.amount;
      const annualInterestRate = userLoan.interest;
      const tenure = userLoan.tenure;
      const { emi, monthlyInterest, principalPerMonth } =
        this._emiCalculator.calculateEmi(
          principalAmount,
          annualInterestRate,
          tenure
        );

      // const today = new Date("2025-04-30"); // for testing phace give dates for testing
      // const today=new Date()
      today.setHours(0, 0, 0, 0);

      const emiSchedule = [];

      const rawDueDate = new Date(userLoan.createdAt); // Get the loan creation date
      const startingDueDate = new Date(rawDueDate); // Clone the original date
      startingDueDate.setHours(0, 0, 0, 0);
      startingDueDate.setMonth(startingDueDate.getMonth() + 1);

      let hasUnpaidEMI = false;

      const paidTransactions = new Map();
      let count = 1;
      if (transactions) {
        transactions.forEach((tx) => {
          paidTransactions.set(count++, tx);
        });
      }

      for (let i = 1; i <= tenure; i++) {
        const thisEmiDueDate = new Date(startingDueDate);
        thisEmiDueDate.setMonth(thisEmiDueDate.getMonth() + (i - 1));
        thisEmiDueDate.setHours(0, 0, 0, 0);

        const isPaid = paidTransactions.has(i);
        let emiStatus: "paid" | "upcoming" | "due" | "grace" | "overdue" =
          "upcoming";
        let penalty = 0;
        let canPay = false;

        const gracePeriodEndDate = new Date(thisEmiDueDate);
        gracePeriodEndDate.setDate(
          gracePeriodEndDate.getDate() + userLoan.gracePeriod
        );
        gracePeriodEndDate.setHours(23, 59, 59, 999);

        const isExactDueDate =
          today.getDate() === thisEmiDueDate.getDate() &&
          today.getMonth() === thisEmiDueDate.getMonth() &&
          today.getFullYear() === thisEmiDueDate.getFullYear();

        if (isPaid) {
          emiStatus = "paid";

          penalty = isPaid ? paidTransactions.get(i)?.penaltyAmount || 0 : 0;
        } else if (today < thisEmiDueDate) {
          emiStatus = "upcoming";
        } else if (isExactDueDate) {
          emiStatus = "due";
          canPay = !hasUnpaidEMI;
        } else if (today > thisEmiDueDate && today <= gracePeriodEndDate) {
          emiStatus = "grace";
          canPay = !hasUnpaidEMI;
        } else {
          emiStatus = "overdue";

          penalty = this._emiCalculator.calculatePenalty(
            emi,
            userLoan.duePenalty,
            gracePeriodEndDate,
            today
          );
          canPay = !hasUnpaidEMI;
          hasUnpaidEMI = true;
        }

        emiSchedule.push({
          emiNumber: i,
          amount: emi,
          dueDate: new Date(thisEmiDueDate),
          gracePeriodEndDate: new Date(gracePeriodEndDate),
          status: emiStatus,
          penalty: penalty,
          transaction: isPaid ? paidTransactions.get(i) : null,
          canPay: canPay,
        });
      }

      return { emiSchedule, userLoan };
    }
}
