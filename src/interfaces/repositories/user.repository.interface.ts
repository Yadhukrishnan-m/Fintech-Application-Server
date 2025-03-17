import { IUser } from "../../models/user.model";
import { UserRegisterDTO } from "../../dtos/user/auth/user-register.dto";
export interface IUserRepository {
  createUser(userData: UserRegisterDTO): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(_id: string): Promise<IUser | null>;
  updatePassword(email: string, hashedPassword: string): Promise<IUser | null>;
  updateUser(_id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  findByAadhaarNumber(aadhaarNumber: string): Promise<IUser | null>,
  findByPanNumber(panNumber: string): Promise<IUser | null>
   fetchUnverifiedUsers(
      query: any,
      sortCriteria: any,
      limit: number,
      skip: number
    ): Promise<{users: IUser[];
    totalPages: number}> 
    fetchVerifiedUsers(
        query: any,
        sortCriteria: any,
        limit: number,
        skip: number
      ): Promise<{ users: IUser[]; totalPages: number }>
   
}
 