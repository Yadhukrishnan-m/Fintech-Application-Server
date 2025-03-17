import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { ProfileCompletionDto } from "../../dtos/user/auth/profile-completion.dto";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IProfileService } from "../../interfaces/services/user-profile.service.interface";
import { IUser } from "../../models/user.model";
import { CustomError } from "../../utils/custom-error";

export class ProfileService implements IProfileService {
  constructor(
    private userRepository: IUserRepository,
    private uploadToS3: IUploadToS3
  ) {}

  async getUser(userId: string): Promise<IUser> {
    const userData: IUser | null = await this.userRepository.findById(userId);
    if (!userData) {
      throw new CustomError(MESSAGES.RESOURCE_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return userData;
  }
  async completeProfile(
    userId: string,
    userData: ProfileCompletionDto
  ): Promise<void> {
    const aadhaarDoc = await this.uploadToS3.upload(userData.aadhaarDoc);
    const panDoc = await this.uploadToS3.upload(userData.panDoc);
    const cibilDoc = await this.uploadToS3.upload(userData.cibilDoc);

 

    const updatedUser = {
      ...userData, 
      aadhaarDoc: aadhaarDoc, 
      panDoc: panDoc, 
      cibilDoc: cibilDoc, 
      income:Number(userData.income),
      cibilScore:Number(userData.cibilScore) ,
      status:'completed'
    };
    const updatedDate = await this.userRepository.updateUser(userId, updatedUser);
    
    // console.log("this is the updated data =>", updatedDate);
  }
}
