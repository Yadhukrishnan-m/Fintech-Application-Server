import { UserRegisterDTO } from "../../dtos/user/auth/user-register.dto";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { UserModel, IUser } from "../../models/user.model";

export class UserRepository implements IUserRepository {
  async createUser(userData: UserRegisterDTO): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }
  async findById(_id: string): Promise<IUser | null> {
    return await UserModel.findById({ _id });
  }
  async updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<IUser | null> {
    return await UserModel.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } }
    );
  }
  async updateUser(
    _id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async fetchUnverifiedUsers(
    query: any,
    sortCriteria: any,
    limit: number,
    skip: number
  ): Promise<{ users: IUser[]; totalPages: number }> {
    const users = await UserModel.find(query)
      .sort(sortCriteria)
      .limit(limit)
      .skip(skip)
      .select("customerId name email cibilScore createdAt");

    const totalUsers = await UserModel.countDocuments(query);
    return { users, totalPages: Math.ceil(totalUsers / limit) };
  }

  async findByAadhaarNumber(aadhaarNumber: string): Promise<IUser | null> {
    return await UserModel.findOne({ aadhaarNumber });
  }

  async findByPanNumber(panNumber: string): Promise<IUser | null> {
    return await UserModel.findOne({ panNumber });
  }
  async fetchVerifiedUsers(
    query: any,
    sortCriteria: any,
    limit: number,
    skip: number
  ): Promise<{ users: IUser[]; totalPages: number }> {
    const users = await UserModel.find(query)
      .sort(sortCriteria)
      .limit(limit)
      .skip(skip)
      .select("customerId name email cibilScore createdAt");

    const totalUsers = await UserModel.countDocuments(query);
    return { users, totalPages: Math.ceil(totalUsers / limit) };
  }
}
