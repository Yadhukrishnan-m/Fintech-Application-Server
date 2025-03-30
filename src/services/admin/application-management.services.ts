import { CustomError } from "../../utils/custom-error";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { LoanDTO } from "../../dtos/admin/loanDto";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { ILoanRepository } from "../../interfaces/repositories/loan.repository.interface";
import { ILoan } from "../../models/loan.model";
import { IApplicationManagementService } from "../../interfaces/services/application-management.services.interface";
import { IApplicationRepository } from "../../interfaces/repositories/application.repository.interface";
import {
  IApplication,
  IApplicationPopulated,
} from "../../models/application.model";
import { verifyApplicationDTO } from "../../dtos/admin/applicationDTO";
import { IEmailService } from "../../interfaces/helpers/email-service.service.interface";
import { application } from "express";
import moment from "moment";
import { IUserLoanRepository } from "../../interfaces/repositories/user-loan.repository.interface";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
@injectable()
export class ApplicationManagementService
  implements IApplicationManagementService
{
  constructor(
    @inject(TYPES.UploadToS3) private _uploadToS3: IUploadToS3,
    @inject(TYPES.UserLoanRepository)
    private _userLoanRepository: IUserLoanRepository,
    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository,
    @inject(TYPES.ApplicationRepository)
    private _applicationRepository: IApplicationRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService
  ) {}
  async getApplications(
    page: number,
    search?: string,
    sortBy?: string,
    filter?: string
  ): Promise<any> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    let query: any = {};
    if (search) {
      query.$or = [{ applicationId: { $regex: search, $options: "i" } }];
    }

    if (filter && filter !== "all") {
      query.status = filter;
    }
    if (!filter) {
      query.status = "pending";
    }

    let sortQuery: any = { createdAt: -1 };
    switch (sortBy) {
      case "amount_desc":
        sortQuery = { amount: -1 };
        break;
      case "amount_asc":
        sortQuery = { amount: 1 };
        break;
      case "newest":
        sortQuery = { createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const totalApplications = await this._applicationRepository.countDocuments(
      query
    );
    const totalPages = Math.ceil(totalApplications / pageSize);

    const applications = await this._applicationRepository.getApplications(
      query,
      sortQuery,
      skip,
      pageSize
    );
    return {
      applications,
      totalPages,
      currentPage: page,
      totalApplications,
    };
  }

  async getApplication(applicationId: string): Promise<IApplicationPopulated> {
    const applicationData =
      await this._applicationRepository.applicationDetails(applicationId);
    if (!applicationData) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return applicationData;
  }

  async verifyApplication(
    applicationId: string,
    statusAndMessage: verifyApplicationDTO
  ): Promise<void> {
    const applicationData = await this._applicationRepository.updateById(
      applicationId,
      statusAndMessage
    );
    if (!applicationData) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    const applicationDataPopulated =
      await this._applicationRepository.applicationDetails(applicationId);
    if (!applicationDataPopulated) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    console.log(applicationDataPopulated.gracePeriod);
    
    const contentData = {
      userName: applicationDataPopulated.userId.name,
      loanName: applicationDataPopulated.userId.name,
      loanId: applicationDataPopulated.loanId.loanId,
   
      amount: applicationDataPopulated.amount,
      interest: applicationDataPopulated.interest,
      tenure: applicationDataPopulated.tenure,
      accountNumber: applicationDataPopulated.accountNumber,
      ifscCode: applicationDataPopulated.ifscCode,
      message: applicationDataPopulated.message,
    };

    if (applicationData.status == "approved") {
      const userLoan = {
        userId: applicationData.userId,
        loanId: applicationData.loanId,
        applicationId: applicationData._id,
        gracePeriod: applicationDataPopulated.gracePeriod,
        amount: applicationData.amount,
        interest: applicationData.interest,
        duePenalty: applicationData.duePenalty,
        tenure: applicationData.tenure,
        nextDueDate: moment().add(1, "months").toDate(),
      };
      const userLoanSaved = await this._userLoanRepository.create(userLoan);
      const transaction = {
        transactionId: "TransactionIdOfLoanProvided",
        userId: applicationData.userId,
        userLoanId: userLoanSaved._id,
        amount: applicationData.amount,
        paymentStatus: "completed",
        type: "payout",
      };
      await this._transactionRepository.create(transaction)
      const content = this._emailService.generateLoanApprovalEmail(contentData);
      await this._emailService.sendEmail(
        applicationDataPopulated.userId.email,
        "Loan Approved",
        content   
      ); 
    }
    if (applicationData.status == "rejected") {
      const content =
        this._emailService.generateLoanRejectionEmail(contentData);
      await this._emailService.sendEmail(
        applicationDataPopulated.userId.email,
        "Loan Rejected",
        content
      );
    }
  }
}
