import { LoanDTO } from "../../dtos/admin/loanDto";
import { ILoan } from "../../models/loan.model";

export interface ILoanManagementService {
  createLoan(loanData: LoanDTO): Promise<void>;
  getLoans(
    page: number,
    search?: string,
    sortBy?: string,
    isActive?: boolean
  ): Promise<{ loans: ILoan[]; totalPages: number }>;
  toggleLoanActivation(loanId: string): Promise<void>;
  getLoan(loanId: string): Promise<ILoan>;
  updateLoan(loanId: string, loanData: LoanDTO): Promise<void>;
}
