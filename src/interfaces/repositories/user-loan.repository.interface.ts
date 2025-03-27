
import { IUserLoan } from "../../models/user-loan.model";
import { IBaseRepository } from "./base.repository.interface";

export interface IUserLoanRepository extends IBaseRepository<IUserLoan> {
  getUserLoanByuserId(
    sortQuery: any,
    skip: number,
    pageSize: number,
    userId: string
  ): Promise<IUserLoan[] | null>;
  countDocuments(query: any): Promise<number>;
}
 