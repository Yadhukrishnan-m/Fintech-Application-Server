import { CustomError } from "../../utils/custom-error";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { LoanDTO } from "../../dtos/admin/loanDto";
import { ILoanRepository } from "../../interfaces/repositories/loan.repository.interface";
import { ILoan } from "../../models/loan.model";

import { IUserLoanRepository } from "../../interfaces/repositories/user-loan.repository.interface";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
import { ICapitalRepository } from "../../interfaces/repositories/capital.repository.interface";
import { IUserLoanManagementService } from "../../interfaces/services/user-loan-management.services.interface";
import { IUserLoan, IUserLoanPopulated } from "../../models/user-loan.model";
import { today } from "../../config/testDate";
import { IEmiCalculator } from "../../interfaces/helpers/emiCalculator.service.interface";
import { ITransaction } from "../../models/transaction.model";
import { IEmi } from "../../dtos/shared/emi.dto";
@injectable()
export class UserLoanManagementService implements IUserLoanManagementService {
  constructor(
    @inject(TYPES.UserLoanRepository)
    private _userLoanRepository: IUserLoanRepository,
      @inject(TYPES.EmiCalculator) private _emiCalculator: IEmiCalculator,

    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository,

    @inject(TYPES.CapitalRepository)
    private _capitalRepository: ICapitalRepository
  ) {}
  async getUserLoans(
    page: number,
    search?: string,
    sortBy?: string,
    filter?: string
  ): Promise<{ userLoans:IUserLoan[], totalPages:number,  }> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    let query: any = {};
    if (search) {
      query.$or = [{ userLoanId: { $regex: search, $options: "i" } }];
    }

    if (filter && filter !== "all") {
      query.status = filter;
    }

    let sortQuery: any = { createdAt: -1 };
    switch (sortBy) {
      case "amount_desc":
        sortQuery = { amount: -1 };
        break;
      case "amount_asc":
        sortQuery = { amount: 1 };
        break;
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      case "interest_desc":
        sortQuery = { interest: -1 };
        break;
      case "interest_asc":
        sortQuery = { interest: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const totalApplications = await this._userLoanRepository.countDocuments(
      query
    );
    const totalPages = Math.ceil(totalApplications / pageSize);

    const userLoans = await this._userLoanRepository.getAllUserLoans(
      query,
      sortQuery,
      skip,
      pageSize
    );
    if (!userLoans) {
      throw new CustomError(MESSAGES.NOT_FOUND,STATUS_CODES.NOT_FOUND)
    }
    return {
      userLoans,
      totalPages,
    };
  }

    async getEmis(
      userLoanId: string
    ): Promise<{ emiSchedule: IEmi[]; userLoan: IUserLoan }> {
      const userLoan: IUserLoan | null = await this._userLoanRepository.findById(
        userLoanId
      );
      if (!userLoan) {
        throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
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

    async getUserLoansOfSingleUser(userId: string): Promise<IUserLoan[]> {

      const userLoans=this._userLoanRepository.getUserLoansOfSingleUser(userId)
      return userLoans
      
    }
}
