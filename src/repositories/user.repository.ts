import { IUserRepository } from "../interfaces/repositories/user.repository.interface";
import { UserModel, IUser } from "../models/user.model";
import {  injectable } from "inversify";
import { BaseRepository } from "./base.repository";

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
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
  async findFinscore(userId:string): Promise<number| null> {
   const user = await UserModel.findOne({ _id: userId }).select("finscore");

  return user?.finscore !== undefined ? user.finscore : null;
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
