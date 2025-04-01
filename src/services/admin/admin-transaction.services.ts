import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IUser } from "../../models/user.model";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ITransactionService } from "../../interfaces/services/transaction.service.interface";
import {
  ITransaction,
  ITransactionPopulated,
} from "../../models/transaction.model";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
import { IAdminTransactionService } from "../../interfaces/services/admin-transaction.service.interface";
@injectable()
export class AdminTransactionService implements IAdminTransactionService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository
  ) {}

  async getTransactions(
    page: number,
    search: string,
    sortBy: string,
    statusFilter: string,
    typeFilter: string,
   
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

    if (typeFilter && ["emi", "payout"].includes(typeFilter)) {
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

    const transactions = await this._transactionRepository.getUserTransactions(
      query,
      sortQuery,
      skip,
      pageSize
    );

    return { transactions, totalPages };
  }
}
