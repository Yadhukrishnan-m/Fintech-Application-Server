import { verifyApplicationDTO } from "../../dtos/admin/applicationDTO";
import { LoanDTO } from "../../dtos/admin/loanDto";
import { IApplication, IApplicationPopulated } from "../../models/application.model";
import { ILoan } from "../../models/loan.model";

export interface IApplicationManagementService {
  getApplications(
    page: number,
    search?: string,
    sortBy?: string,
    filter?: string
  ): Promise<{ loans: IApplication[]; totalPages: number }>;
  getApplication(
    applicationId: string
  ): Promise<
    IApplicationPopulated & { averageMonthlyEmi: number; monthlyIncome: number }
  >;
  verifyApplication(
    applicationId: string,
    statusAndMessage: verifyApplicationDTO
  ): Promise<void>;
}
