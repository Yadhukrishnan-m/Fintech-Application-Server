import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IUserManagementService } from "../../interfaces/services/user-management.service.interface";
import { IUser } from "../../models/user.model";
import { CustomError } from "../../utils/custom-error";
export class UserManagementService implements IUserManagementService {
  constructor(private userRepository: IUserRepository) {}

  async getUnverifiedUsers(
    page: number,
    search?: string,
    sortBy?: string,
    filter?: string
  ): Promise<{ users: IUser[]; totalPages: number }> {
    const limit = 10;
    const skip = (page - 1) * limit;

    const query: any = { status: "completed" };

    // Search by Name, Email, or Customer ID
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { customerId: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by CIBIL Score Range
    if (filter) {
      const [min, max] = filter.split("-").map(Number);

      // ✅ Ensure values are valid numbers
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

    return await this.userRepository.fetchUnverifiedUsers(
      query,
      sortCriteria,
      limit,
      skip
    );
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new CustomError(MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return user;
  }
  async verifyUser(id: string, userstatus: boolean): Promise<void> {
    if (userstatus) {
      const user = await this.userRepository.findById(id);
      if (!user || !user.aadhaarNumber || !user.panNumber) {
        throw new CustomError(MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }

      const existingUserWithAadhaar =
        await this.userRepository.findByAadhaarNumber(user.aadhaarNumber);
      if (
        existingUserWithAadhaar &&
        existingUserWithAadhaar.status === "verified"
      ) {
        throw new CustomError(
          "Aadhaar number already registered with a verified user",
          409
        );
      }
      const existingUserWithPan = await this.userRepository.findByPanNumber(
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
    };
    await this.userRepository.updateUser(id, userData);
  }
  async blacklistUser(id: string, action: boolean): Promise<void> {
 

    const userData = {
      isBlacklisted: action,
    };
    await this.userRepository.updateUser(id, userData);
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

    return await this.userRepository.fetchVerifiedUsers(
      query,
      sortCriteria,
      limit,
      skip
    );
  }
}
