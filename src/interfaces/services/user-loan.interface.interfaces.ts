import { IEmi } from "../../dtos/shared/emi.dto";
import { ILoan } from "../../models/loan.model";
import { IUserLoan } from "../../models/user-loan.model";

export interface IUserLoanService {
  getUserLoanByUserId(
    userId: string,
    page: number
  ): Promise<{
    userLoan: IUserLoan[];
    totalPages: number;
    currentPage: number;
    totalUserLoans: number;
  }>;
  getEmis(
    userLoanId: String,
    userId:string
  ): Promise<{ emiSchedule: IEmi[]; userLoan: IUserLoan }>;
}
