import { ILoan } from "../../models/loan.model";
import { IUserLoan } from "../../models/user-loan.model";

export interface ILoanService {
  getLoans(): Promise<ILoan[]>;
  getLoan(loanId: string): Promise<ILoan>;
  getInterest(userId:string,loanId:string):Promise<number>;
  
}
