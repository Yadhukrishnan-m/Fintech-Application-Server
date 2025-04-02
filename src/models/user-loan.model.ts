import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";
import { ILoan } from "./loan.model";
import { ITransaction } from "./transaction.model";
import { IApplication } from "./application.model";

export interface IUserLoan extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  loanId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  amount: number;
  interest: number;
  duePenalty: number;
  userLoanId: string;
  tenure: number;
  gracePeriod: number;
  appliedDetails: string;
  transaction: mongoose.Types.ObjectId[]; // References to transactions
  createdAt: Date;
  // nextDueDate: Date;
}

export interface IUserLoanPopulated {
  userId: IUser;
  loanId: ILoan;
  applicationId: IApplication;
  amount: number;
  interest: number;
  duePenalty: number;
  userLoanId:string;
  tenure: number;
  gracePeriod: number;
  appliedDetails: string;
  transaction: ITransaction[];
  createdAt: Date;
  // nextDueDate: Date;
}

const UserLoanSchema = new Schema<IUserLoan>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    amount: { type: Number, required: true },
    userLoanId: { type: String, required: true },
    gracePeriod: { type: Number, required: true },
    interest: { type: Number, required: true },
    duePenalty: { type: Number, required: true },
    tenure: { type: Number, required: true },
    // nextDueDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const UserLoanModel = mongoose.model<IUserLoan>(
  "UserLoan",
  UserLoanSchema
);
