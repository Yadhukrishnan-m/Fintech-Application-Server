
import { ITransaction } from "../../models/transaction.model";
import { IUserLoan } from "../../models/user-loan.model";
import { IBaseRepository } from "./base.repository.interface";

export interface ITransactionRepository extends IBaseRepository<ITransaction> {}
 