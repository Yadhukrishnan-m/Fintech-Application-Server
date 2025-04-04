import nodemailer from "nodemailer";
import { IEmailService } from "../../interfaces/helpers/email-service.service.interface";
import dotenv from "dotenv";
import { injectable } from "inversify";
import {  loanContentDTO } from "../../dtos/admin/applicationDTO";
import { IUserLoan } from "../../models/user-loan.model";
import { IUser } from "../../models/user.model";

dotenv.config();
@injectable()
export class EmailService implements IEmailService {
  private transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string,
    },
  });

  async sendEmail(
    toEmail: string,
    subject: string,
    content: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER as string,
      to: toEmail,
      subject,
      html: content,
    };

    await this.transporter.sendMail(mailOptions);
  }
  generateOtpEmailContent(otp: number): string {
    return `
    <body style="margin: 0; padding: 0; background-color: #fff; font-family: 'Arial', sans-serif; color: #000;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" style="background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #000;">
          <!-- Title -->
          <tr>
            <td align="center" style="font-size: 22px; font-weight: bold; padding-bottom: 10px; color: #000;">
              Verify Your Email
            </td>
          </tr>
          <!-- Message -->
          <tr>
            <td align="center" style="font-size: 16px; line-height: 1.5; padding-bottom: 20px; color: #333;">
              Welcome to <strong style="color: #000;">QuicFin</strong>! To complete your registration, use the OTP below:
            </td>
          </tr>
          <!-- OTP Code -->
          <tr>
            <td align="center">
              <div style="display: inline-block; padding: 15px 30px; font-size: 28px; font-weight: bold; 
                          color: #fff; background-color: #000; border-radius: 8px; letter-spacing: 3px;">
                ${otp}
              </div>
            </td>
          </tr>

          <!-- Expiration & Warning -->
          <tr>
            <td align="center" style="font-size: 14px; padding-top: 20px; color: #333;">
              This OTP is valid for <strong style="color: #000;">2 minutes</strong>. Please do not share it with anyone.
            </td>
          </tr>
          <!-- Support -->
          <tr>
            <td align="center" style="font-size: 14px; padding-top: 20px; color: #555;">
              If you did not request this, ignore this email. <br>For assistance, contact 
              <a href="mailto:support@quicfin.com" style="color: #000; text-decoration: none; border-bottom: 1px solid #000;">support@quicfin.com</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  generateResetPasswordEmailContent(resetLink: string): string {
    return `
  <body style="margin: 0; padding: 0; background-color: #fff; font-family: 'Arial', sans-serif; color: #000;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0" style="background: #fff; padding: 40px; border-radius: 10px; box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #000;">
            <!-- Title -->
            <tr>
              <td align="center" style="font-size: 22px; font-weight: bold; padding-bottom: 10px; color: #000;">
                Reset Your Password
              </td>
            </tr>
            <!-- Message -->
            <tr>
              <td align="center" style="font-size: 16px; line-height: 1.5; padding-bottom: 20px; color: #333;">
                We received a request to reset your password. Click the button below to set a new password:
              </td>
            </tr>
            <!-- Reset Password Button -->
            <tr>
              <td align="center">
                <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 15px 30px; font-size: 18px; font-weight: bold;
                            color: #fff; background-color: #000; border-radius: 8px; text-decoration: none;">
                  Reset Password
                </a>
              </td>
            </tr>
            <!-- Expiration & Warning -->
            <tr>
              <td align="center" style="font-size: 14px; padding-top: 20px; color: #333;">
                This link is valid for <strong style="color: #000;">15 minutes</strong>. If you didn't request this, please ignore this email.
              </td>
            </tr>
            <!-- Support -->
            <tr>
              <td align="center" style="font-size: 14px; padding-top: 20px; color: #555;">
                For assistance, contact 
                <a href="mailto:support@quicfin.com" style="color: #000; text-decoration: none; border-bottom: 1px solid #000;">
                  support@quicfin.com
                </a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  }

  generateLoanApprovalEmail(data: loanContentDTO) {
    const {
      userName,
      loanName,
      loanId,
      amount,
      interest,
      tenure,
      accountNumber,
      ifscCode,
    } = data;

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loan Approval Notification</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Arial', sans-serif; color: #000;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0" style="background: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #ddd;">
            <!-- Header -->
            <tr>
              <td align="center" style="font-size: 24px; font-weight: bold; padding-bottom: 10px; color: #008080;">
                Loan Application Approved ✅
              </td>
            </tr>
            <!-- Message -->
            <tr>
              <td align="center" style="font-size: 16px; line-height: 1.5; padding-bottom: 20px; color: #333;">
                Dear <strong>${userName}</strong>, <br>Congratulations! Your loan application has been successfully verified and approved. The loan amount has been credited to your account.
              </td>
            </tr>
            <!-- Loan Details -->
            <tr>
              <td align="center" style="font-size: 16px; line-height: 1.6; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                <strong style="color: #008080;">Loan Details:</strong><br>
                Loan Name: <strong>${loanName}</strong><br>
                Loan ID: <strong>${loanId}</strong><br>
                Amount: <strong>₹${amount}</strong><br>
                Interest Rate: <strong>${interest}%</strong><br>
                Tenure: <strong>${tenure} months</strong>
              </td>
            </tr>
            <!-- Account Details -->
            <tr>
              <td align="center" style="font-size: 16px; line-height: 1.6; padding: 20px; margin-top: 15px;">
                <strong style="color: #008080;">Credited To:</strong><br>
                Account Number: <strong>${accountNumber}</strong><br>
                IFSC Code: <strong>${ifscCode}</strong>
              </td>
            </tr>
            <!-- Support Section -->
            <tr>
              <td align="center" style="font-size: 14px; padding-top: 20px; color: #555;">
                If you have any questions, feel free to contact our support team at <br>
                <a href="mailto:support@quicfin.com" style="color: #008080; text-decoration: none; font-weight: bold;">
                  support@quicfin.com
                </a>.
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td align="center" style="padding-top: 30px;">
                <a href="https://quicfin.com" style="background: #008080; color: #ffffff; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
                  Visit QuicFin
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  }
  generateLoanRejectionEmail(data: loanContentDTO) {
    const { userName, loanName, loanId, amount, message } = data;

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loan Application Rejection</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Arial', sans-serif; color: #000;">
    <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; padding: 20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellspacing="0" cellpadding="0" style="background: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1); border: 1px solid #ddd;">
            <!-- Header -->
            <tr>
              <td align="center" style="font-size: 24px; font-weight: bold; padding-bottom: 10px; color: #d9534f;">
                Loan Application Rejected ❌
              </td>
            </tr>
            <!-- Message -->
            <tr>
              <td align="center" style="font-size: 16px; line-height: 1.5; padding-bottom: 20px; color: #333;">
                Dear <strong>${userName}</strong>, <br>
                We regret to inform you that your loan application has been **rejected** due to the following reason:
              </td>
            </tr>
            <!-- Rejection Reason -->
            <tr>
              <td align="center" style="font-size: 16px; line-height: 1.6; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                <strong style="color: #d9534f;">Reason for Rejection:</strong><br>
                <strong>${message}</strong>
              </td>
            </tr>
            <!-- Loan Details -->
            <tr>
              <td align="center" style="font-size: 16px; line-height: 1.6; padding: 20px; margin-top: 15px;">
                <strong style="color: #008080;">Loan Details:</strong><br>
                Loan Name: <strong>${loanName}</strong><br>
                Loan ID: <strong>${loanId}</strong><br>
                Requested Amount: <strong>₹${amount}</strong>
              </td>
            </tr>
            <!-- Support Section -->
            <tr>
              <td align="center" style="font-size: 14px; padding-top: 20px; color: #555;">
                If you have any questions or believe this decision was made in error, feel free to contact our support team at <br>
                <a href="mailto:support@quicfin.com" style="color: #d9534f; text-decoration: none; font-weight: bold;">
                  support@quicfin.com
                </a>.
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
  }

  generateOverdueEmiEmailContent(
    user: IUser,
    userLoan: IUserLoan,
    overdueEmiCount: number,
    totalPenalty: number
  ): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Overdue EMI Reminder</title>
      <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100 py-10">
      <div class="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-center text-red-600 text-2xl font-semibold">
              ⚠️ Overdue EMI Payment Reminder
          </h2>

          <p class="mt-4 text-gray-700">Dear <strong>${user.name}</strong>,</p>

          <p class="text-gray-700 mt-2">
              We hope you're doing well. This is a gentle reminder regarding your **pending EMI payments** 
              for your loan <strong>(Loan ID: ${userLoan.userLoanId})</strong>.
          </p>

          ${
            overdueEmiCount > 0
              ? `<p class="text-red-600 font-semibold mt-2">🔴 ${overdueEmiCount} overdue EMI(s) pending.</p>`
              : ""
          }

          ${
            totalPenalty > 0
              ? `<p class="text-red-600 font-semibold mt-2">
                 ⚠️ A penalty of ₹${totalPenalty.toFixed(
                   2
                 )} has been applied due to late payments.
              </p>`
              : ""
          }

          <p class="text-gray-700 mt-4">
              To avoid further penalties and ensure a good credit score, we kindly request you to clear your dues at the earliest.
          </p>

          <div class="border-t border-gray-300 mt-4 pt-4">
              <p class="text-gray-700">📧 Email: <a href="mailto:support@quicfin.com" class="text-blue-600 hover:underline">support@quicfin.com</a></p>
              <p class="text-gray-700">📞 Phone: +91 XXXXX XXXXX</p>
          </div>

          <p class="text-center text-gray-600 mt-6">Thank you for your prompt attention.</p>

          <p class="text-center text-gray-800 font-semibold mt-2">🏦 QuicFin Support Team</p>
      </div>
  </body>
  </html>`;
  }
}
