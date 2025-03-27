import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";
import { ILoan } from "./loan.model";

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  loanId: mongoose.Types.ObjectId;
  amount: number;
  tenure: number;
  interest: number;
  duePenalty: number;
  applicationId: String;
  status: string;
  message: string;
  accountNumber: string;
  ifscCode: string;
  documents: Record<string, string>[];
}
export interface IApplicationPopulated  {
  userId: IUser;
  loanId: ILoan;
  amount: number;
  tenure: number;
  interest: number;
  duePenalty: number;
  applicationId: String;
  status: string;
  message: string;
  accountNumber: string;
  ifscCode: string;
  documents: Record<string, string>[];
}
const ApplicationSchema = new Schema<IApplication>(
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
    applicationId: { type: String, required: true },
    amount: { type: Number, required: true },
    accountNumber: { type: String, required: true },

    ifscCode: { type: String, required: true },

    tenure: { type: Number, required: true },
    interest: { type: Number, required: true },
    duePenalty: { type: Number, required: true },
    status: { type: String, required: true, default: "pending" },
    message: { type: String },
    documents: [
      {
        type: Map,
        of: String,
      },
    ],
  },
  { timestamps: true }
);

export const ApplicationModel = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema
);
