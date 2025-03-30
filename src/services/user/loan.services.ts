import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ILoan } from "../../models/loan.model";
import { ILoanService } from "../../interfaces/services/loan.service.interface";
import { ILoanRepository } from "../../interfaces/repositories/loan.repository.interface";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { redisClient } from "../../config/redis";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { InterestCalculator } from "../helpers/interestcalculator.services";
import { IUser } from "../../models/user.model";
import { IUserLoan } from "../../models/user-loan.model";
@injectable()
export class LoanService implements ILoanService {
  constructor(
    @inject(TYPES.LoanRepository) private _loanRepository: ILoanRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.InterestCalculator)
    private _interestCalculator: InterestCalculator,

    @inject(TYPES.UploadToS3) private _uploadToS3: IUploadToS3
  ) {}

  async getLoans(
    page: number,
    search?: string,
    sortBy?: string
  ): Promise<{ loans: ILoan[]; totalPages: number }> {
    const pageSize = 5; // Number of loans per page
    const skip = (page - 1) * pageSize; // Calculate skip value for pagination

    let query: any = {};

    // Implement search filter
    if (search) {
      query.$or = [
        { loanId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    // Default sorting by newest loans
    let sortQuery: any = { createdAt: -1 };

    // Apply sorting based on input
    switch (sortBy) {
      case "name":
        sortQuery = { name: 1 }; // Sort by Loan Name (A-Z)
        break;
      case "minAmount_low":
        sortQuery = { minAmount: 1 }; // Min Amount: Low to High
        break;
      case "minAmount_high":
        sortQuery = { minAmount: -1 }; // Min Amount: High to Low
        break;
      case "maxAmount_low":
        sortQuery = { maxAmount: 1 }; // Max Amount: Low to High
        break;
      case "maxAmount_high":
        sortQuery = { maxAmount: -1 }; // Max Amount: High to Low
        break;
      case "interest_low":
        sortQuery = { interest: 1 }; // Min Interest: Low to High
        break;
      case "interest_high":
        sortQuery = { interest: -1 }; // Min Interest: High to Low
        break;
      case "penalty_low":
        sortQuery = { penalty: 1 }; // Due Penalty: Low to High
        break;
      case "penalty_high":
        sortQuery = { penalty: -1 }; // Due Penalty: High to Low
        break;
      default:
        sortQuery = { createdAt: -1 }; // Default to newest loans first
    }

    const { loans, totalPages } = await this._loanRepository.findAllActiveLoans(
      query,
      sortQuery,
      skip,
      pageSize
    );
   
    

    if (!loans || loans.length === 0) {
      throw new CustomError(
        MESSAGES.RESOURCE_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    const expiresIn = 300;
    const plainLoans = loans.map((loan) => loan.toObject());
    const processedLoans = await Promise.all(
      plainLoans.map(async (loan) => {
        const cacheKey = `${loan.loanImage}`;
        let signedUrl = await redisClient.get(cacheKey);
        if (!signedUrl) {
          signedUrl = await this._uploadToS3.getSignedUrl(
            loan.loanImage,
            expiresIn
          );
          await redisClient.set(cacheKey, signedUrl, {
            EX: 300,
          });
        }
        return { ...loan, loanImage: signedUrl };
      })
    );

    return { loans: processedLoans, totalPages };
  }

  async getLoan(loanId: string): Promise<ILoan> {
    const loanData = await this._loanRepository.findById(loanId);
    if (!loanData) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const fileKey = loanData.loanImage;
    const expiresIn = 300;
    let signedUrl = await redisClient.get(fileKey);
    if (!signedUrl) {
      signedUrl = await this._uploadToS3.getSignedUrl(fileKey, expiresIn);
      await redisClient.set(fileKey, signedUrl, { EX: expiresIn });
    }
    return { ...loanData.toObject(), loanImage: signedUrl };
  }
  async getInterest(userId: string, loanId: string): Promise<number> {
    const userData: IUser | null = await this._userRepository.findById(userId);
    const loanData: ILoan | null = await this._loanRepository.findById(loanId);

    if (!userData || !loanData) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    if (userData.status !== "verified") {
      throw new CustomError("user not verified", STATUS_CODES.UNAUTHORIZED);
    }
    if (!userData.cibilScore) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    const interest = this._interestCalculator.calculateInterest(
      userData.cibilScore,
      loanData.minimumInterest,
      loanData.maximumInterest
    );

    return interest;
  }
}
