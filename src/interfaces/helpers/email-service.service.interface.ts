import { loanContentDTO } from "../../dtos/admin/applicationDTO";

export interface IEmailService {
  sendEmail(toEmail: string, subject: string, content: string): Promise<void>;
  generateOtpEmailContent(otp: number): string;
  generateResetPasswordEmailContent(resetLink: string): string;
  generateLoanApprovalEmail(data: loanContentDTO): string;
  generateLoanRejectionEmail(data: loanContentDTO):string
}
