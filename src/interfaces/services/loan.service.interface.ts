import { ILoan } from "../../models/loan.model";
import { IUserLoan } from "../../models/user-loan.model";

export interface ILoanService {
  getLoans(
    page: number,
    search?: string,
    sortBy?: string,
  ): Promise<{ loans: ILoan[]; totalPages: number }>;
  getLoan(loanId: string): Promise<ILoan>;
  getInterest(userId: string, loanId: string): Promise<number>;
}
