import { ITransaction, ITransactionPopulated } from "../../models/transaction.model";

export interface IAdminTransactionService {
  getTransactions(
    page: number,
    search: string,
    sortBy: string,
    statusFilter: string,
    typeFilter: string,

  ): Promise<{ transactions: ITransaction[]; totalPages: number }>;
}
