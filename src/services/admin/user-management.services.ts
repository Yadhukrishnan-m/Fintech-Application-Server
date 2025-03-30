import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { redisClient } from "../../config/redis";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IUserManagementService } from "../../interfaces/services/user-management.service.interface";
import { IUser } from "../../models/user.model";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
@injectable()
export class UserManagementService implements IUserManagementService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.UploadToS3) private _uploadToS3: IUploadToS3
  ) {}

  async getUnverifiedUsers(
    page: number,
    search?: string,
    sortBy?: string,
    filter?: string
  ): Promise<{ users: IUser[]; totalPages: number }> {
    const limit = 10;
    const skip = (page - 1) * limit;

    const query: any = { status: "completed" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { customerId: { $regex: search, $options: "i" } },
      ];
    }

    if (filter) {
      const [min, max] = filter.split("-").map(Number);

      if (!isNaN(min) && !isNaN(max)) {
        query.cibilScore = { $gte: min, $lte: max };
      }
    }


    let sortCriteria = {};
    if (sortBy === "cibil_desc") sortCriteria = { cibilScore: -1 };
    else if (sortBy === "cibil_asc") sortCriteria = { cibilScore: 1 };
    else if (sortBy === "newest") sortCriteria = { createdAt: -1 };
    else if (sortBy === "oldest") sortCriteria = { createdAt: 1 };

    return await this._userRepository.fetchUnverifiedUsers(
      query,
      sortCriteria,
      limit,
      skip
    );
  }

  async getUserById(id: string): Promise<IUser> {
    const userData = await this._userRepository.findById(id);
    if (
      !userData ||
      !userData.aadhaarDoc ||
      !userData.panDoc ||
      !userData.cibilDoc
    ) {
      throw new CustomError(MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    const user = userData.toObject();
    const expiresIn = 300;
    const getSignedUrlWithCache = async (fileKey: string): Promise<string> => {
      let signedUrl = await redisClient.get(fileKey);
      if (!signedUrl) {
        signedUrl = await this._uploadToS3.getSignedUrl(fileKey, expiresIn);
        await redisClient.set(fileKey, signedUrl, { EX: expiresIn });
      }
      return signedUrl;
    };
    const aadhaarDoc = await getSignedUrlWithCache(user.aadhaarDoc);
    const panDoc = await getSignedUrlWithCache(user.panDoc);
    const cibilDoc = await getSignedUrlWithCache(user.cibilDoc);
    const updatedUser = { ...user, aadhaarDoc, panDoc, cibilDoc };
    return updatedUser;
  }
  async verifyUser(id: string, userstatus: boolean,message?:string): Promise<void> {
    if (userstatus) {
      const user = await this._userRepository.findById(id);
      if (!user || !user.aadhaarNumber || !user.panNumber) {
        throw new CustomError(MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }

      const existingUserWithAadhaar =
        await this._userRepository.findByAadhaarNumber(user.aadhaarNumber);
      if (
        existingUserWithAadhaar &&
        existingUserWithAadhaar.status === "verified"
      ) {
        throw new CustomError(
          "Aadhaar number already registered with a verified user",
          409
        );
      }
      const existingUserWithPan = await this._userRepository.findByPanNumber(
        user.panNumber
      );
      if (existingUserWithPan && existingUserWithPan.status === "verified") {
        throw new CustomError(
          "PAN number already registered with a verified user",
          409
        );
      }
    }

    const userData = {
      status: userstatus ? "verified" : "rejected",
      message: message? message:''
    };
    await this._userRepository.updateById(id, userData);
  }
  async blacklistUser(id: string, action: boolean): Promise<void> {
    const userData = {
      isBlacklisted: action,
    };
    await this._userRepository.updateById(id, userData);
  }

  async getVerifiedUsers(
    page: number,
    search?: string,
    sortBy?: string,
    filter?: string
  ): Promise<{ users: IUser[]; totalPages: number }> {
    const limit = 10;
    const skip = (page - 1) * limit;

    const query: any = { status: "verified" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { customerId: { $regex: search, $options: "i" } },
      ];
    }

    if (filter) {
      const [min, max] = filter.split("-").map(Number);

      if (!isNaN(min) && !isNaN(max)) {
        query.cibilScore = { $gte: min, $lte: max };
      }
    }
    // Sorting Logic
    let sortCriteria = {};
    if (sortBy === "cibil_desc") sortCriteria = { cibilScore: -1 };
    else if (sortBy === "cibil_asc") sortCriteria = { cibilScore: 1 };
    else if (sortBy === "newest") sortCriteria = { createdAt: -1 };
    else if (sortBy === "oldest") sortCriteria = { createdAt: 1 };

    return await this._userRepository.fetchVerifiedUsers(
      query,
      sortCriteria,
      limit,
      skip
    );
  }
}
