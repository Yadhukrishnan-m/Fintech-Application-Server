import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import {
  ITransaction,
  ITransactionPopulated,
} from "../../models/transaction.model";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
import { ICapitalAndTransactionService } from "../../interfaces/services/capital-transaction.service.interface";
import { ICapitalRepository } from "../../interfaces/repositories/capital.repository.interface";
import { ICapital } from "../../models/capital.model";
import { TransactionModelMapper } from "../../utils/mappers/transaction-mapper";
import { today } from "../../config/testDate";
@injectable()
export class CapitalAndTransactionService
  implements ICapitalAndTransactionService
{
  constructor(
    @inject(TYPES.CapitalRepository)
    private _capitalRepository: ICapitalRepository,
    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository
  ) {}

  async getTransactions(
    page: number,
    search: string,
    sortBy: string,
    statusFilter: string,
    typeFilter: string
  ): Promise<{ transactions: ITransaction[]; totalPages: number }> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    let query: any = {};
    if (search) {
      const searchNumber = parseFloat(search);

      query.$or = [{ transactionId: { $regex: search, $options: "i" } }];

      if (!isNaN(searchNumber)) {
        query.$or.push({ amount: searchNumber });
      }
    }
    let sortQuery: any = { createdAt: -1 };

    if (
      statusFilter &&
      ["pending", "completed", "failed"].includes(statusFilter)
    ) {
      query.paymentStatus = statusFilter;
    }

    if (typeFilter && ["emi", "payout","capitalDeposit"].includes(typeFilter)) {
      query.type = typeFilter;
    }

    switch (sortBy) {
      case "amount_desc":
        sortQuery = { amount: -1 };
        break;
      case "amount_asc":
        sortQuery = { amount: 1 };
        break;
      case "createdAt_desc":
        sortQuery = { createdAt: -1 };
        break;
      case "createdAt_asc":
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const totalApplications = await this._transactionRepository.countDocuments(
      query
    );
    const totalPages = Math.ceil(totalApplications / pageSize);

    const transactions = await this._transactionRepository.getTransactions(
      query,
      sortQuery,
      skip,
      pageSize
    );
 
    return { transactions, totalPages };
  }

  async addCapital(amount: number): Promise<void> {
    if (amount < 0) {
      throw new CustomError(MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
     await this._capitalRepository.incBalance(amount);

 
   const transactionData: {
     transactionId: string;
     amount: number;
     paymentStatus: "pending" | "completed" | "failed";
     type: "emi" | "capitalDeposit";
     createdAt:Date
   } = {
     transactionId: Math.random().toString(36).substring(2, 20),
     amount: amount,
     paymentStatus: "completed",
     type: "capitalDeposit",
     createdAt: today,
   };
    const transaction = TransactionModelMapper.toModel(transactionData);
    await this._transactionRepository.create(transaction)
  }

  async getCapital(): Promise<ICapital> {
    
   const capital=  await this._capitalRepository.findOne({});
   if (!capital) {
    throw new CustomError(MESSAGES.NOT_FOUND,STATUS_CODES.NOT_FOUND)
   }
   return capital
  }
}
