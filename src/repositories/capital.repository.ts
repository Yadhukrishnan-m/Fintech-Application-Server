
import { injectable } from "inversify";
import { IOtpRepository } from "../interfaces/repositories/otp.repository.interface";
import OtpModel, { IOtp } from "../models/otp.model";
import { BaseRepository } from "./base.repository";
import { ICapitalRepository } from "../interfaces/repositories/capital.repository.interface";
import CapitalModel, { ICapital } from "../models/capital.model";
@injectable()
export class CapitalRepository
  extends BaseRepository<ICapital>
  implements ICapitalRepository
{
  constructor() {
    super(CapitalModel);
  }
  async incBalance(amount: number): Promise<ICapital> {
    return await CapitalModel.findOneAndUpdate(
      {},
      { $inc: { availableBalance: amount } },
      { upsert: true, new: true }
    );
  }
  async decBalance(amount: number): Promise<ICapital> {
    return await CapitalModel.findOneAndUpdate(
      {},
      { $inc: { availableBalance: -amount } },
      { upsert: true, new: true }
    );
  }
}