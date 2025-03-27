import {  injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { IUserLoan, UserLoanModel } from "../models/user-loan.model";
import { IUserLoanRepository } from "../interfaces/repositories/user-loan.repository.interface";

@injectable()
export class UserLoanRepository
  extends BaseRepository<IUserLoan>
  implements IUserLoanRepository

{
  constructor() {
    super(UserLoanModel);
  }
 async getUserLoanByuserId(
    sortQuery: any,
    skip: number,
    pageSize: number,
    userId:string
  ){
    return await UserLoanModel.find({ userId: userId })
      .populate({
        path: "loanId",
        select: "loanId name",
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize)
      .lean();
  }
  async countDocuments(query: any): Promise<number> {
    return await UserLoanModel.countDocuments(query);
  }


}
