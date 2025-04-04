import { IEmi } from "../../dtos/shared/emi.dto";
import { IUserLoan } from "../../models/user-loan.model";


export interface IUserLoanManagementService {
  getUserLoans(
    page: number,
    search?: string,
    sortBy?: string,
    filter?: string
  ): Promise<{
    userLoans: IUserLoan[];
    totalPages: Number;
  }>;

  getEmis(
    userLoanId: String
  ): Promise<{ emiSchedule: IEmi[]; userLoan: IUserLoan }>;
  getUserLoansOfSingleUser(userId:string):Promise<IUserLoan[]>
}








