
import { IUserLoan, IUserLoanPopulated } from "../../models/user-loan.model";
import { IBaseRepository } from "./base.repository.interface";

export interface IUserLoanRepository extends IBaseRepository<IUserLoan> {
  getUserLoanByuserId(
    sortQuery: any,
    skip: number,
    pageSize: number,
    userId: string
  ): Promise<IUserLoan[] | null>;
  countDocuments(query: any): Promise<number>;
  getAllUserLoans(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<IUserLoan[] | null>;
  getUserLoansOfSingleUser(userId: string): Promise<IUserLoan[]>;
  getTotalLoanAmount(): Promise<number>;
  getTotalUserLoanCount(): Promise<number>;
  getLoansBetweenDates(
      startDate: Date,
      endDate: Date
    ): Promise<IUserLoan[]>
}
 