import { Container } from "inversify";
import { TYPES } from "./inversify.types";

// User Repositories
import { UserRepository } from "../../repositories/user.repository";
import { OtpRepository } from "../../repositories/otp.repository";

// Admin Repositories
import { AdminRepository } from "../../repositories/admin.repository";

// Services (Common)
import { PasswordService } from "../../services/helpers/password-hash.services";
import { EmailService } from "../../services/helpers/email.services";
import { JwtService } from "../../services/helpers/jwt-auth.services";
import UploadToS3 from "../../services/helpers/FileUploadService";

// User Services
import { AuthUserService } from "../../services/user/auth-user.services";
import { ProfileService } from "../../services/user/user-profile.services";

// Admin Services
import { AuthAdminService } from "../../services/admin/auth-admin.services"; 
import { UserManagementService } from "../../services/admin/user-management.services";

// User Controllers
import { AuthUserController } from "../../controllers/user/auth-user.controllers";
import { ProfileController } from "../../controllers/user/user-profile.controllers";

// Admin Controllers
import { AuthAdminController } from "../../controllers/admin/auth-admin.controllers";
import { UserManagementController } from "../../controllers/admin/user-management.controllers";
import { LoanManagementController } from "../../controllers/admin/loan-management.controllers";
import { LoanManagementService } from "../../services/admin/loan-management.services";
import { LoanRepository } from "../../repositories/loan.repository";
import { LoanController } from "../../controllers/user/loan.controllers";
import { LoanService } from "../../services/user/loan.services";
import { ApplicationController } from "../../controllers/user/application.controllers";
import { InterestCalculator } from "../../services/helpers/interestcalculator.services";
import { ApplicationService } from "../../services/user/application.services";
import { ApplicationRepository } from "../../repositories/application.repository";
import { ApplicationManagementService } from "../../services/admin/application-management.services";
import { ApplicationManagementController } from "../../controllers/admin/application-management.controllers";
import { UserLoanRepository } from "../../repositories/user-loan.repository";
import { Transaction } from "mongodb";
import { TransactionRepository } from "../../repositories/transaction.repository";
import { UserLoanController } from "../../controllers/user/user-loan.controllers";
import { UserLoanService } from "../../services/user/user-loan.services";
import { EmiCalculator } from "../../services/helpers/emiCalculator.services";

// Create the Inversify container
const container = new Container();

// Bind User Repositories
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<OtpRepository>(TYPES.OtpRepository).to(OtpRepository);
container.bind<LoanRepository>(TYPES.LoanRepository).to(LoanRepository);
container.bind<ApplicationRepository>(TYPES.ApplicationRepository).to(ApplicationRepository)
container
  .bind<UserLoanRepository>(TYPES.UserLoanRepository)
  .to(UserLoanRepository);
  container
    .bind<TransactionRepository>(TYPES.TransactionRepository)
    .to(TransactionRepository);

// Bind Admin Repositories
container.bind<AdminRepository>(TYPES.AdminRepository).to(AdminRepository);

// Bind Common Services
container.bind<PasswordService>(TYPES.PasswordService).to(PasswordService);
container.bind<EmailService>(TYPES.EmailService).to(EmailService);
container.bind<JwtService>(TYPES.JwtService).to(JwtService);
container.bind<UploadToS3>(TYPES.UploadToS3).to(UploadToS3);
container.bind<EmiCalculator>(TYPES.EmiCalculator).to(EmiCalculator);
container
  .bind<InterestCalculator>(TYPES.InterestCalculator)
  .to(InterestCalculator);



// Bind User Services
container.bind<AuthUserService>(TYPES.AuthUserService).to(AuthUserService);
container.bind<ProfileService>(TYPES.ProfileService).to(ProfileService);
container.bind<LoanService>(TYPES.LoanService).to(LoanService);
container
  .bind<ApplicationService>(TYPES.ApplicationService)
  .to(ApplicationService);
  container.bind<UserLoanService>(TYPES.UserLoanService).to(UserLoanService);


// Bind Admin Services
container.bind<AuthAdminService>(TYPES.AuthAdminService).to(AuthAdminService);
container
  .bind<ApplicationManagementService>(TYPES.ApplicationManagementService)
  .to(ApplicationManagementService);
container
  .bind<LoanManagementService>(TYPES.LoanManagementService)
  .to(LoanManagementService);

container
  .bind<UserManagementService>(TYPES.UserManagementService)
  .to(UserManagementService);

// Bind User Controllers
container
  .bind<AuthUserController>(TYPES.AuthUserController)
  .to(AuthUserController);
container
  .bind<ProfileController>(TYPES.ProfileController)
  .to(ProfileController);
container.bind<LoanController>(TYPES.LoanController).to(LoanController);
container
  .bind<ApplicationController>(TYPES.ApplicationController)
  .to(ApplicationController);
container
  .bind<UserLoanController>(TYPES.UserLoanController)
  .to(UserLoanController);

// Bind Admin Controllers
container
  .bind<AuthAdminController>(TYPES.AuthAdminController)
  .to(AuthAdminController);
container
  .bind<UserManagementController>(TYPES.UserManagementController)
  .to(UserManagementController);
  container
    .bind<LoanManagementController>(TYPES.LoanManagementController)
    .to(LoanManagementController);
     container
       .bind<ApplicationManagementController>(
         TYPES.ApplicationManagementController
       )
       .to(ApplicationManagementController);

export { container };
