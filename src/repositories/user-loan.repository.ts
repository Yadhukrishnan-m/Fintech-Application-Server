import {  injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { IUserLoan, IUserLoanPopulated, UserLoanModel } from "../models/user-loan.model";
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
    userId: string
  ) {
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

  async getAllUserLoans(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<IUserLoan[] | null> {
    return await UserLoanModel.find(query)
      .populate({
        path: "loanId",
        select: "loanId name",
      })
      .populate({
        path: "userId",
        select: "customerId name email",
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize)
      .lean();
  }

  async getUserLoansOfSingleUser(userId: string): Promise<IUserLoan[]> {
    return await UserLoanModel.find({ userId: userId })
      .select("userLoanId amount tenure interest gracePeriod duePenalty")
      .populate({
        path: "loanId",
        select: "_id name",
      });
  }

  async getTotalLoanAmount(): Promise<number> {
    const result = await UserLoanModel.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    return result[0]?.totalAmount || 0;
  }
  async getTotalUserLoanCount(): Promise<number> {
    return await UserLoanModel.countDocuments();
  }

  async getLoansBetweenDates(
    startDate: Date,
    endDate: Date
  ): Promise<IUserLoan[]> {
    return await UserLoanModel.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    // .populate({
    //   path: "loanId",
    //   select: "loanId name",
    // })
    // .populate({
    //   path: "userId",
    //   select: "customerId name email",
    // })
    // .lean();
  }

  async getRunningLoans(userId: string): Promise<IUserLoan[]> {
    return await UserLoanModel.find({
      userId: userId,
      
      status: "running",
    });
      
  }
}
