import { LoanDTO } from "../../dtos/admin/loanDto";
import LoanModel, { ILoan } from "../../models/loan.model";

export class LoanModelMapper {
  static toModel(dto: LoanDTO, imageUrl: string, loanId: string): ILoan {
    return new LoanModel({
      loanId: loanId,
      name: dto.name,
      description: dto.description,
      isActive: dto.status == "Active",
      minimumAmount: Number(dto.minimumAmount),
      maximumAmount: Number(dto.maximumAmount),
      minimumTenure: Number(dto.minimumTenure),
      maximumTenure: Number(dto.maximumTenure),
      minimumInterest: Number(dto.minimumInterest),
      maximumInterest: Number(dto.maximumInterest),
      duePenalty: Number(dto.duePenalty),
      gracePeriod:Number(dto.gracePeriod),
      features: dto.features,
      eligibility: dto.eligibility,
      loanImage: imageUrl,
      additionalDocuments:dto.additionalDocuments
    });
  }
}
