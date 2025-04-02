import { ICapital } from "../../models/capital.model";
import { ITransaction, ITransactionPopulated } from "../../models/transaction.model";

export interface ICapitalAndTransactionService {
  getTransactions(
    page: number,
    search: string,
    sortBy: string,
    statusFilter: string,
    typeFilter: string
  ): Promise<{ transactions: ITransaction[]; totalPages: number }>;

  addCapital(
    amount:number
  ): Promise<void>;
  getCapital():Promise<ICapital>
}
