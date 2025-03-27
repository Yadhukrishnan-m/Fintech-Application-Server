import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import LoanModel, { ILoan } from "../models/loan.model";
import { ILoanRepository } from "../interfaces/repositories/loan.repository.interface";
@injectable()
export class LoanRepository
  extends BaseRepository<ILoan>
  implements ILoanRepository
{
  constructor() {
    super(LoanModel);
  }
  async getLoans(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<{ loans: ILoan[]; totalPages: number }> {
    const loans = await LoanModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(pageSize);
    const totalLoans = await LoanModel.countDocuments(query);
    const totalPages = Math.ceil(totalLoans / pageSize);

    return { loans, totalPages };
  }
  async findAllActiveLoans(): Promise<ILoan[]> {
    return await LoanModel.find({ isActive: true });
  }
}
