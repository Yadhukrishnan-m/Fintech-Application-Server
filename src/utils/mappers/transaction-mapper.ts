import mongoose from "mongoose";
import { ITransaction, TransactionModel } from "../../models/transaction.model";

export class TransactionModelMapper {
  static toModel(transactionData: {
    transactionId: string;
    userId?: string;
    userLoanId?: string;
    amount: number;
    interestAmount?: number;
    penaltyAmount?: number;
    paymentStatus: "pending" | "completed" | "failed";
    type: "emi" | "payout" |"capitalDeposit";
  }): ITransaction {
    return new TransactionModel({
      transactionId: transactionData.transactionId,
      userId: new mongoose.Types.ObjectId(transactionData.userId),
      userLoanId: new mongoose.Types.ObjectId(transactionData.userLoanId),
      amount: transactionData.amount,
      interestAmount: transactionData.interestAmount,
      penaltyAmount: transactionData.penaltyAmount,
      paymentStatus: transactionData.paymentStatus,
      type: transactionData.type,
    });
  }
}
