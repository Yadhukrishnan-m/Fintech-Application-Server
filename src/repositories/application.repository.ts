import {  injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { ApplicationModel, IApplication, IApplicationPopulated } from "../models/application.model";
import { IApplicationRepository } from "../interfaces/repositories/application.repository.interface";
import { IUser } from "../models/user.model";
import { ILoan } from "../models/loan.model";

@injectable()
export class ApplicationRepository
  extends BaseRepository<IApplication>
  implements IApplicationRepository
{
  constructor() {
    super(ApplicationModel);
  }

  async countDocuments(query: any): Promise<number> {
    return await ApplicationModel.countDocuments(query);
  }

  async getApplications(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ) {
    return await ApplicationModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize)
      .lean();
  }

  async applicationDetails(id: string): Promise<IApplicationPopulated | null> {
    return await ApplicationModel.findById(id)
      .populate<{ userId: IUser }>("userId")
      .populate<{ loanId: ILoan }>("loanId")
      .lean();
  }
  async getApplicationsByuserId(
    sortQuery: any,
    skip: number,
    pageSize: number,
    userId:string
  ){
    return await ApplicationModel.find({userId:userId})
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize)
      .lean();
  }
}
