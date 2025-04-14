import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ILoan } from "../../models/loan.model";
import { ILoanRepository } from "../../interfaces/repositories/loan.repository.interface";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { redisClient } from "../../config/redis";
import { IApplicationService } from "../../interfaces/services/application.service.interface";
import { ApplicationDto } from "../../dtos/admin/applicationDTO";
import { InterestCalculator } from "../helpers/interestcalculator.services";
import { IUser } from "../../models/user.model";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IApplicationRepository } from "../../interfaces/repositories/application.repository.interface";
import { LoanApplicationModelMapper } from "../../utils/mappers/application-mapper";
import { IApplication, IApplicationPopulated } from "../../models/application.model";
@injectable()
export class ApplicationService implements IApplicationService {
  constructor(
    @inject(TYPES.LoanRepository) private _loanRepository: ILoanRepository,
    @inject(TYPES.ApplicationRepository)
    private _applicationRepository: IApplicationRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.UploadToS3) private _uploadToS3: IUploadToS3,
    @inject(TYPES.InterestCalculator)
    private _interestCalculator: InterestCalculator
  ) {}

  async createApplication(
    applicationData: ApplicationDto,
    userId: string
  ): Promise<void> {
    const { loanId, amount, tenure, documents, accountNumber, ifscCode } =
      applicationData;
      
      

    if (!loanId || !amount || !tenure) {
      throw new CustomError(MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
    const uploadedDocuments = await Promise.all(
      documents.map(async (file) => {
        const s3Key = await this._uploadToS3.upload(file);
        return { [file.fieldname]: s3Key };
      })
    );
    const loanDetails: ILoan | null = await this._loanRepository.findById(
      loanId
    );



    const userDetails: IUser | null = await this._userRepository.findById(
      userId
    );
    if (userDetails?.isBlacklisted) {
      throw new CustomError(MESSAGES.BLACKLISTED,STATUS_CODES.BAD_REQUEST)
    }
     if (!loanDetails?.isActive) {
       throw new CustomError(MESSAGES.DEACTIVATED_LOAN, STATUS_CODES.BAD_REQUEST);
     }


    if (
      !loanDetails ||
      !loanDetails.duePenalty ||
      !userDetails ||
      !userDetails.cibilScore ||
      !loanDetails.gracePeriod ||
      userDetails.finscore==null
    ) {
      

 console.log("Validation Failed:");
 if (!loanDetails) console.log("loanDetails is missing or null");
 else {
   if (!loanDetails.duePenalty)
     console.log("loanDetails.duePenalty is missing or falsy");
   if (!loanDetails.gracePeriod)
     console.log("loanDetails.gracePeriod is missing or falsy");
 }

 if (!userDetails) console.log("userDetails is missing or null");
 else {
   if (!userDetails.cibilScore)
     console.log("userDetails.cibilScore is missing or falsy");
   if (userDetails.finscore == null)
     console.log("userDetails.finscore is null");
 }

      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (
      amount < loanDetails.minimumAmount ||
      amount > loanDetails.maximumAmount ||
      tenure < loanDetails.minimumTenure ||
      tenure > loanDetails.maximumTenure
    ) {
    
      
      throw new CustomError(MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    const interest = this._interestCalculator.calculateInterest(
      userDetails.cibilScore,
      userDetails.finscore,
      loanDetails.minimumInterest,
      loanDetails.maximumInterest
    );

    const newapplicationData = {
      duePenalty: loanDetails.duePenalty,
      documents,
      interest,
      loanId,
      amount,
      tenure,
      gracePeriod:loanDetails.gracePeriod,
      accountNumber,
      ifscCode,
    };

    const newApplication = LoanApplicationModelMapper.toModel(
      newapplicationData,
      userId,
      uploadedDocuments
    );
 
    
    await this._applicationRepository.create(newApplication);
  }

  async getApplicationsByUserId(
    userId: string,
    page: number
  ): Promise<{
    applications: IApplication[];
    totalPages: number;
    currentPage: number;
    totalApplications: number;
  }> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const totalApplications = await this._applicationRepository.countDocuments(
      {}
    );
    const totalPages = Math.ceil(totalApplications / pageSize);
    const applications = await this._applicationRepository.getApplicationsByuserId(
      { createdAt: -1 },
      skip,
      pageSize,userId
    );
    return {
      applications:applications || [],
      totalPages,
      currentPage: page,
      totalApplications,
    };
  }

  async getApplicationDetails(userId:string,applicationId: string): Promise<IApplicationPopulated> {

   const applicationDetails :IApplicationPopulated | null= await this._applicationRepository.applicationDetails(
     applicationId
   );
   
   if (!applicationDetails) {
    throw new CustomError(MESSAGES.NOT_FOUND,STATUS_CODES.NOT_FOUND)
   }
   if (applicationDetails.userId._id.toString()!==userId) {
       throw new CustomError(MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
   }
      const expiresIn = process.env.URL_EXPIRY as unknown as number;
      for (const document of applicationDetails.documents) {
        const key = Object.keys(document)[0];
        let signedUrl = await redisClient.get(document[key]);
        if (!signedUrl) {
          signedUrl= await this._uploadToS3.getSignedUrl(
          document[key],
          expiresIn
        );
        await redisClient.set(document[key], signedUrl, {
          EX: 300,
        });
        }
        document[key] =signedUrl
      }


      
    
   
return applicationDetails
  }
}
