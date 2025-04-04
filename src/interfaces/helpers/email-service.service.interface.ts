import { loanContentDTO } from "../../dtos/admin/applicationDTO";
import { IUserLoan } from "../../models/user-loan.model";
import { IUser } from "../../models/user.model";

export interface IEmailService {
  sendEmail(toEmail: string, subject: string, content: string): Promise<void>;
  generateOtpEmailContent(otp: number): string;
  generateResetPasswordEmailContent(resetLink: string): string;
  generateLoanApprovalEmail(data: loanContentDTO): string;
  generateLoanRejectionEmail(data: loanContentDTO):string;
  generateOverdueEmiEmailContent(
      user: IUser,
      userLoan: IUserLoan,
      overdueEmiCount: number,
      totalPenalty: number
    ): string 
}
