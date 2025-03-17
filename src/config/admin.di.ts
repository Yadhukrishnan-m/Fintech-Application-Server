
  import { AdminRepository } from "../repositories/admin/admin.repository";
  import { AuthUserService } from "../services/admin/auth-admin.services";
  import {  PasswordService } from "../services/helpers/password-hash.services";
  import { AuthAdminController } from "../controllers/admin/auth-admin.controllers";
  import { JwtService } from "../services/helpers/jwt-auth.services";
  import { UserManagementService } from "../services/admin/user-management.services";
  import { UserRepository } from "../repositories/user/user.repository";
  import { UserManagementController } from "../controllers/admin/user-management.controllers";
  const adminRepository = new AdminRepository();
  const userRepository=new UserRepository()
  const passwordService=new PasswordService()

  const authAdminService = new AuthUserService(
    adminRepository,  
    passwordService,
    JwtService
  );

  const userManagementService = new UserManagementService(userRepository);

  const userManagementController = new UserManagementController(
    userManagementService
  );

  const authAdminController = new AuthAdminController(authAdminService);

  export { authAdminController, userManagementController };
