  import mongoose, { Schema, Document } from "mongoose";

  export interface ILoan extends Document {
    loanId: string;
    name: string;
    description: string;
    isActive: Boolean;
    minimumAmount: number;
    maximumAmount: number;
    minimumTenure: number;
    maximumTenure: number;
    minimumInterest: number;
    maximumInterest: number;
    duePenalty: number;
    features: string;
    eligibility: string;
    loanImage: string;
    additionalDocuments: [string];
  }

  const LoanSchema: Schema = new Schema(
    {
      loanId: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      isActive: { type: Boolean, required: true },
      minimumAmount: { type: Number, required: true },
      maximumAmount: { type: Number, required: true },
      minimumTenure: { type: Number, required: true },
      maximumTenure: { type: Number, required: true },
      minimumInterest: { type: Number, required: true },
      maximumInterest: { type: Number, required: true },
      duePenalty: { type: Number, required: true },
      features: { type: String, required: true },
      eligibility: { type: String, required: true },
      loanImage: { type: String, required: true },
      additionalDocuments: { type: [String]},
    },
    { timestamps: true }
  );

  const LoanModel = mongoose.model<ILoan>("Loan", LoanSchema);
  export default LoanModel;
