import { ITransaction, ITransactionPopulated } from "../../models/transaction.model";

export interface ITransactionService {
  getTransactions(
    page: number,
    search: string,
    sortBy: string,
    statusFilter: string,
    typeFilter: string,
    userId:string
  ): Promise<{ transactions: ITransaction[]; totalPages: number }>;
}
