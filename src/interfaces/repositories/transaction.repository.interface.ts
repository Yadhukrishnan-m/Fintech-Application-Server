
import { ITransaction, ITransactionPopulated } from "../../models/transaction.model";
import { IUserLoan } from "../../models/user-loan.model";
import { IBaseRepository } from "./base.repository.interface";

export interface ITransactionRepository extends IBaseRepository<ITransaction> {
  getUserLoanTransactions(userLoanId: string): Promise<ITransaction[]>;
  countDocuments(query: any): Promise<number>;
  getUserTransactions(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<ITransaction[]>;
  getTransactions(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<ITransaction[]>;
}
 