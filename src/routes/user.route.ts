import express, { NextFunction, Request, Response } from "express";
// import { authUserController,profilecontroller } from "../config/user.di";
import { authenticateUser } from "../middlewares/user-auth.middleware";
import { uploadAdditionalDocs, uploadFiles } from "../middlewares/multer.middleware";

import { container } from "../config/inversify/inversify.config"; 
import { TYPES } from "../config/inversify/inversify.types";
import { AuthUserController } from "../controllers/user/auth-user.controllers";
import { ProfileController } from "../controllers/user/user-profile.controllers";
import { LoanController } from "../controllers/user/loan.controllers";
import { ApplicationController } from "../controllers/user/application.controllers";
import { UserLoanController } from "../controllers/user/user-loan.controllers";
const authUserController = container.get<AuthUserController>(
  TYPES.AuthUserController
);
const profileController = container.get<ProfileController>(
  TYPES.ProfileController
);
const loanController = container.get<LoanController>(
  TYPES.LoanController
);
const userLoanController=container.get<UserLoanController>(TYPES.UserLoanController)
const applicationController=container.get<ApplicationController>(TYPES.ApplicationController)
const router = express.Router();

router.post("/register", (req: Request, res: Response, next: NextFunction) =>
  authUserController.register(req, res, next)
);
router.post(
  "/generate-otp",
  (req: Request, res: Response, next: NextFunction) =>
    authUserController.generateOtp(req, res, next)
);
router.post("/verify-otp", (req: Request, res: Response, next: NextFunction) =>
  authUserController.verifyOtp(req, res, next)
);
router.post("/login", (req: Request, res: Response, next: NextFunction) =>
  authUserController.login(req, res, next)
);
router.post(
  "/refresh-token",
  (req: Request, res: Response, next: NextFunction) =>
    authUserController.refreshToken(req, res, next)
);
router.post("/google-login", (req: Request, res: Response, next: NextFunction) =>
  authUserController.googleLogin(req, res, next)
);
router.post(
  "/forgot-password",
  (req: Request, res: Response, next: NextFunction) =>
    authUserController.forgotPassword(req, res, next)
);
router.post(
  "/reset-password",
  (req: Request, res: Response, next: NextFunction) =>
    authUserController.resetPassword(req, res, next)
);
router.patch(
  "/change-password",authenticateUser,
  (req: Request, res: Response, next: NextFunction) =>
    authUserController.changePassword(req, res, next)
);
router.post(
  "/logout",
  (req: Request, res: Response, next: NextFunction) =>
    authUserController.logout(req, res, next)
);

router.get(
  "/get-user",
  authenticateUser,
  (req: Request, res: Response, next: NextFunction) =>
    profileController.getUser(req, res, next)
);
router.post(
  "/complete-profile",
  authenticateUser,uploadFiles,
  (req: Request, res: Response, next: NextFunction) =>
    profileController.completeProfile(req, res, next)
);
router.get(
  "/loans",
  (req: Request, res: Response, next: NextFunction) =>
    loanController.getLoans(req, res, next)
);
router.get(
  "/loan/:id",
  authenticateUser,
  (req: Request, res: Response, next: NextFunction) =>
    loanController.getLoan(req, res, next)
);
router.get(
  "/get-interest/:loanId",
  authenticateUser,
  (req: Request, res: Response, next: NextFunction) =>
   {  
    
    loanController.getInterest(req, res, next)}
);
 
router.post(
  "/apply-loan",
  authenticateUser,
  uploadAdditionalDocs,
  (req: Request, res: Response, next: NextFunction) =>
    applicationController.createApplication(req, res, next)
);

router.get(
  "/applications",
  authenticateUser,
  (req: Request, res: Response, next: NextFunction) => {
    applicationController.getApplicationsByUserId(req, res, next);
  }
);

router.get(
  "/user-loans",
  authenticateUser,
  (req: Request, res: Response, next: NextFunction) => {
    userLoanController.getUserLoansByUserId(req, res, next);
  }
);

router.get(
  "/application/:applicationId/details",
  authenticateUser,
  (req: Request, res: Response, next: NextFunction) => {
    applicationController.getApplicationDetails(req, res, next);
  }
);

router.get(
  "/user-loan/emis/:userLoanId",
  
  (req: Request, res: Response, next: NextFunction) => {
    userLoanController.getUserLoanEmis(req, res, next);
  }
);

export default router;
