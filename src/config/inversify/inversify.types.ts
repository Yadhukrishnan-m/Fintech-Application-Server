import { UserLoanController } from "../../controllers/user/user-loan.controllers";
import { UserLoanService } from "../../services/user/user-loan.services";


export const TYPES = {
  // repositories
  UserRepository: Symbol.for("UserRepository"),
  AdminRepository: Symbol.for("AdminRepository"),
  OtpRepository: Symbol.for("OtpRepository"),
  LoanRepository: Symbol.for("LoanRepository"),
  ApplicationRepository: Symbol.for("ApplicationRepository"),
  UserLoanRepository: Symbol.for("UserLoanRepository"),
  TransactionRepository: Symbol.for("TransactionRepository"),
  CapitalRepository:Symbol.for("CapitalRepository"),
  //external services
  PasswordService: Symbol.for("PasswordService"),
  EmailService: Symbol.for("EmailService"),
  JwtService: Symbol.for("JwtService"),
  UploadToS3: Symbol.for("UploadToS3"),
  InterestCalculator: Symbol.for("InterestCalculator"),
  EmiCalculator: Symbol.for("EmiCalculator"),
  RazorpayService: Symbol.for("RazorpayService"),
  //services
  AuthAdminService: Symbol.for("AuthAdminService"),
  UserManagementService: Symbol.for("UserManagementService"),
  AuthUserService: Symbol.for("AuthUserService"),
  ProfileService: Symbol.for("ProfileService"),
  LoanManagementService: Symbol.for("LoanManagementService"),
  LoanService: Symbol.for("LoanService"),
  ApplicationManagementService: Symbol.for("ApplicationManagementService"),
  ApplicationService: Symbol.for("ApplicationService"),
  UserLoanService: Symbol.for("UserLoanService"),
  PaymentService: Symbol.for("PaymentService"),
  TransactionService: Symbol.for("TransactionService"),
  CapitalAndTransactionService: Symbol.for("CapitalAndTransactionService"),
  // controllers
  AuthAdminController: Symbol.for("AuthAdminController"),
  LoanManagementController: Symbol.for("LoanManagementController"),
  ApplicationController: Symbol.for("ApplicationController"),
  ApplicationManagementController: Symbol.for(
    "ApplicationManagementController"
  ),
  UserLoanController: Symbol.for("UserLoanController"),
  CapitalAndTransactionController: Symbol.for(
    "CapitalAndTransactionController"
  ),
  TransactionController: Symbol.for("TransactionController"),
  UserManagementController: Symbol.for("UserManagementController"),
  AuthUserController: Symbol.for("AuthUserController"),
  ProfileController: Symbol.for("ProfileController"),
  LoanController: Symbol.for("LoanController"),
  PaymentController: Symbol.for("PaymentController"),
};
