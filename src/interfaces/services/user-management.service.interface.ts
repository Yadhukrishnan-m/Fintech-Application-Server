import { IUser } from "../../models/user.model";

export interface IUserManagementService {
  getUnverifiedUsers(
    page: number,
    search?: string,
    sortBy?: string,
    filterCibil?: string
  ): Promise<{ users: IUser[]; totalPages: number }>;
  getUserById(id: string): Promise<IUser>;
  verifyUser(id: string, userstatus: boolean): Promise<void>;
  getVerifiedUsers(
    page: number,
    search?: string,
    sortBy?: string,
    filter?: string
  ): Promise<{ users: IUser[]; totalPages: number }>;
  blacklistUser(id: string, action: boolean): Promise<void>;
}   