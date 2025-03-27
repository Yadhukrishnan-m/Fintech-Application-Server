import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IUserLoan } from "../../models/user-loan.model";
import { IUserLoanRepository } from "../../interfaces/repositories/user-loan.repository.interface";
import { IUserLoanService } from "../../interfaces/services/user-loan.interface.interfaces";
@injectable()
export class UserLoanService implements IUserLoanService     {
  constructor(
    @inject(TYPES.UserLoanRepository) private _userLoanRepository: IUserLoanRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
  

  ) {}

  async getUserLoanByUserId(
    userId: string,
    page: number
  ): Promise<{
    userLoan: IUserLoan[];
    totalPages: number;
    currentPage: number;
    totalUserLoans: number;
  }> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const totalUserLoans = await this._userLoanRepository.countDocuments({});
    const totalPages = Math.ceil(totalUserLoans / pageSize);
    const userLoans = await this._userLoanRepository.getUserLoanByuserId(
      { createdAt: -1 },
      skip,
      pageSize,
      userId
    );
    return {
      userLoan: userLoans || [],
      totalPages,
      currentPage: page,
      totalUserLoans,
    };
  }
}
