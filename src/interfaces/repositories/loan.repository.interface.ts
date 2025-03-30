import { IBaseRepository } from "./base.repository.interface";
import { ILoan } from "../../models/loan.model";
export interface ILoanRepository extends IBaseRepository<ILoan> {
  getLoans(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<{ loans: ILoan[]; totalPages: number }>;
  findAllActiveLoans(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<{ loans: ILoan[]; totalPages: number }>;
}
