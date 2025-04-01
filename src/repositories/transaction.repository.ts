import {  injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { IUserLoan, UserLoanModel } from "../models/user-loan.model";
import { IUserLoanRepository } from "../interfaces/repositories/user-loan.repository.interface";
import { ITransactionRepository } from "../interfaces/repositories/transaction.repository.interface";
import { ITransaction, ITransactionPopulated, TransactionModel } from "../models/transaction.model";

@injectable()
export class TransactionRepository
  extends BaseRepository<ITransaction>
  implements ITransactionRepository
{
  constructor() {
    super(TransactionModel);
  }

  async getUserLoanTransactions(userLoanId: string): Promise<ITransaction[]> {
    return await TransactionModel.find({
      userLoanId,
      paymentStatus: "completed",
      type: "emi",
    }).sort({ createdAt: 1 });
  }

  async countDocuments(query: any): Promise<number> {
    return await TransactionModel.countDocuments(query);
  }
  async getUserTransactions(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<ITransaction[]> {
    return await TransactionModel.find(query)
      .populate({
        path: "userLoanId",
        populate: {
          path: "loanId",
          select: "name",
        },
        select: "userLoanId",
      })
      // .populate("userId", "name email")
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize);
  }
  async getTransactions(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<ITransaction[]> {
    return await TransactionModel.find(query)
      .populate({
        path: "userLoanId",
        populate: {
          path: "loanId",
          select: "name",
        },
        select: "userLoanId",
      })
      .populate("userId", "name customerId email")
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize);
  }
}
