import {  injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { IUserLoan, UserLoanModel } from "../models/user-loan.model";
import { IUserLoanRepository } from "../interfaces/repositories/user-loan.repository.interface";
import { ITransactionRepository } from "../interfaces/repositories/transaction.repository.interface";
import { ITransaction, TransactionModel } from "../models/transaction.model";

@injectable()
export class TransactionRepository
  extends BaseRepository<ITransaction>
  implements ITransactionRepository
{
  constructor() {
    super(TransactionModel);
  }

 async  getUserLoanTransactions(userLoanId:string):Promise<ITransaction[]>{
  return await TransactionModel.find({
    userLoanId,
    paymentStatus: "completed",
    type: "emi",
  });
 }
}
