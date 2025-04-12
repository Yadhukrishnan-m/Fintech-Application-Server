import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { ProfileCompletionDto } from "../../dtos/user/auth/profile-completion.dto";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IProfileService } from "../../interfaces/services/user-profile.service.interface";
import { IUser } from "../../models/user.model";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { redisClient } from "../../config/redis";
import { IEmailService } from "../../interfaces/helpers/email-service.service.interface";
@injectable()
export class ProfileService implements IProfileService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.UploadToS3) private _uploadToS3: IUploadToS3,
    @inject(TYPES.EmailService) private _emailService: IEmailService
  ) {}

  async getUser(userId: string): Promise<IUser> {
    const userData: IUser | null = await this._userRepository.findById(userId);

    if (!userData) {
      throw new CustomError(
        MESSAGES.RESOURCE_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }

    const expiresIn = process.env.URL_EXPIRY as unknown as number;

    // Function to get signed URL with Redis caching
    const getSignedUrl = async (docKey: string) => {
      let signedUrl = await redisClient.get(docKey);
      if (!signedUrl) {
        signedUrl = await this._uploadToS3.getSignedUrl(docKey, expiresIn);
        await redisClient.set(docKey, signedUrl, { EX: expiresIn });
      }
      return signedUrl;
    };

    // Replace document keys with signed URLs only if they exist
    if (userData.aadhaarDoc) {
      userData.aadhaarDoc = await getSignedUrl(userData.aadhaarDoc);
    }
    if (userData.cibilDoc) {
      userData.cibilDoc = await getSignedUrl(userData.cibilDoc);
    }
    if (userData.panDoc) {
      userData.panDoc = await getSignedUrl(userData.panDoc);
    }

    return userData;
  }
  async completeProfile(
    userId: string,
    userData: ProfileCompletionDto
  ): Promise<void> {
    const aadhaarDoc = await this._uploadToS3.upload(userData.aadhaarDoc);
    const panDoc = await this._uploadToS3.upload(userData.panDoc);
    const cibilDoc = await this._uploadToS3.upload(userData.cibilDoc);

    const updatedUser = {
      ...userData,
      aadhaarDoc: aadhaarDoc,
      panDoc: panDoc,
      cibilDoc: cibilDoc,
      income: Number(userData.income),
      cibilScore: Number(userData.cibilScore),
      status: "completed",
    };
    const updatedDate = await this._userRepository.updateById(
      userId,
      updatedUser
    );
  }

  async contactUs(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    message: string
  ): Promise<void> {
    const content=this._emailService.generateContactUsEmailContent( firstName,lastName,email,phone,message)
    await this._emailService.sendEmail("yadhumon2003@gmail.com","User Enquiry",content)


  }
}
