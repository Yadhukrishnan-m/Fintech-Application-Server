import { IUser } from "../../models/user.model";
import { IBaseRepository } from "./base.repository.interface";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  updatePassword(email: string, hashedPassword: string): Promise<IUser | null>;
  findByAadhaarNumber(aadhaarNumber: string): Promise<IUser | null>;
  findByPanNumber(panNumber: string): Promise<IUser | null>;
  fetchUnverifiedUsers(
    query: any,
    sortCriteria: any,
    limit: number,
    skip: number
  ): Promise<{ users: IUser[]; totalPages: number }>;
  fetchVerifiedUsers(
    query: any,
    sortCriteria: any,
    limit: number,
    skip: number
  ): Promise<{ users: IUser[]; totalPages: number }>;
  findFinscore(userId: string): Promise<number | null>;
  findCount(): Promise<number>;
}
 