import { CustomError } from "../../utils/custom-error";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ILoanManagementService } from "../../interfaces/services/loan-management.service.interface";
import { LoanDTO } from "../../dtos/admin/loanDto";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { ILoanRepository } from "../../interfaces/repositories/loan.repository.interface";
import { LoanModelMapper } from "../../utils/mappers/loan-mapper";
import { ILoan } from "../../models/loan.model";
@injectable()
export class LoanManagementService implements ILoanManagementService {
  constructor(
    @inject(TYPES.UploadToS3) private _uploadToS3: IUploadToS3,
    @inject(TYPES.LoanRepository) private _loanRepository: ILoanRepository
  ) {}
  async createLoan(loanData: LoanDTO): Promise<void> {
    if (!loanData.loanImage) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    // Normalize the loan name by trimming spaces
    const normalizedLoanName = loanData.name.trim();

    // Check if a loan with the same name (case-insensitive) already exists
    const existingLoan = await this._loanRepository.findOne({
      name: { $regex: new RegExp(`^${normalizedLoanName}$`, "i") },
    });

    if (existingLoan) {
      throw new CustomError(MESSAGES.ALREADY_EXISTS, STATUS_CODES.CONFLICT);
    }
    const loanImageUrl = await this._uploadToS3.upload(loanData.loanImage);

    const loanId = Math.random().toString(36).substring(2, 9);

    const loanModel = LoanModelMapper.toModel(loanData, loanImageUrl, loanId);
    await this._loanRepository.create(loanModel);
  }
  async getLoans(
    page: number,
    search?: string,
    sortBy?: string,
    isActive?: boolean
  ) {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    let query: any = {};

    if (search) {
      query.$or = [
        { loanId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    let sortQuery: any = { createdAt: -1 };

    // Set sort query based on provided sortBy parameter
    switch (sortBy) {
      case "minAmount_low":
        sortQuery = { minimumAmount: 1 };
        break;
      case "minAmount_high":
        sortQuery = { minimumAmount: -1 };
        break;
      case "maxAmount_low":
        sortQuery = { maximumAmount: 1 };
        break;
      case "maxAmount_high":
        sortQuery = { maximumAmount: -1 };
        break;
      case "interest_low":
        sortQuery = { minimumInterest: 1 };
        break;
      case "interest_high":
        sortQuery = { minimumInterest: -1 };
        break;
      case "penalty_low":
        sortQuery = { duePenalty: 1 };
        break;
      case "penalty_high":
        sortQuery = { duePenalty: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    return await this._loanRepository.getLoans(
      query,
      sortQuery,
      skip,
      pageSize
    );
  }

  async toggleLoanActivation(loanId: string): Promise<void> {
    const loan = await this._loanRepository.findById(loanId);
    if (!loan) {
      throw new Error("Loan not found");
    }
    const updatedStatus = !loan.isActive;

    await this._loanRepository.updateById(loanId, { isActive: updatedStatus });
  }

  async getLoan(loanId: string): Promise<ILoan> {
    const loanData = await this._loanRepository.findById(loanId);
    if (!loanData) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    const expiresIn = 300;
    const imageurl = await this._uploadToS3.getSignedUrl(
      loanData.loanImage,
      expiresIn
    );

    return { ...loanData.toObject(), loanImage: imageurl };
  }

  async updateLoan(loanId: string, loanData: LoanDTO): Promise<void> {
    let updatedData = { ...loanData };
    let loanImageUrl: string | undefined;
    const existingLoan = await this._loanRepository.findById(loanId);
    if (!existingLoan) {
      throw new Error("Loan not found");
    }
    if (loanData.loanImage) {
      loanImageUrl = await this._uploadToS3.upload(loanData.loanImage);
      await this._uploadToS3.delete(existingLoan.loanImage);
    } else {
      loanImageUrl = existingLoan.loanImage;
    }
    const { loanImage, ...restData } = updatedData;
    const loanModel = LoanModelMapper.toModel(
      restData,
      loanImageUrl,
      existingLoan.loanId
    );
    const { _id, ...sanitizedLoanModel } = loanModel.toObject
      ? loanModel.toObject()
      : loanModel;
    await this._loanRepository.updateById(loanId, sanitizedLoanModel);
  }
}
