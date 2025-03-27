import { ApplicationDto } from "../../dtos/admin/applicationDTO";
import { IApplication, ApplicationModel } from "../../models/application.model";
import mongoose from "mongoose";

export class LoanApplicationModelMapper {
  static toModel(
    dto: ApplicationDto,
    userId: string,
    uploadedDocuments: Record<string, string>[]
  ): IApplication {
    return new ApplicationModel({
      userId: new mongoose.Types.ObjectId(userId),
      loanId: new mongoose.Types.ObjectId(dto.loanId),
      amount: Number(dto.amount),
      interest: Number(dto.interest),
      duePenalty: Number(dto.duePenalty),
      tenure: Number(dto.tenure),
      accountNumber:dto.accountNumber,
      ifscCode:dto.ifscCode,
      documents: uploadedDocuments,
      applicationId: Math.random().toString(36).substring(2, 9),
      status: "pending",
      message: "",
    });
  }
}
