import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";
import { ILoan } from "./loan.model";
import { IUserLoan } from "./user-loan.model";

export interface ITransaction extends Document {
  transactionId: string;
  userId?: mongoose.Types.ObjectId;
  userLoanId?: mongoose.Types.ObjectId;
  amount: number;
  interestAmount?: number;
  penaltyAmount?: number;
  paymentStatus: string;
  type: string;
}

export interface ITransactionPopulated {
  transactionId: string;
  userId?: IUser;
  userLoanId?: IUserLoan;
  amount: number;
  interestAmount?: number;
  penaltyAmount?: number;
  paymentStatus: string;
  type: string;

}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userLoanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserLoan",
      required: true,
    },
    amount: { type: Number, required: true },
    interestAmount: { type: Number },
    penaltyAmount: { type: Number },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
    },
    type: {
      type: String,
      required: true,
      enum: ["emi", "payout", "capitalDeposit"],
    },
  },
  { timestamps: true }
);

export const TransactionModel = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
