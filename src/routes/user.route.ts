import express, { NextFunction, Request, Response } from "express";
// import { authUserController,profilecontroller } from "../config/user.di";
import { authorizeRole } from "../middlewares/roleAuth";
import {
  uploadAdditionalDocs,
  uploadFiles,
} from "../middlewares/multer.middleware";

import { container } from "../config/inversify/inversify.config";
import { TYPES } from "../config/inversify/inversify.types";
import { AuthUserController } from "../controllers/user/auth-user.controllers";
import { ProfileController } from "../controllers/user/user-profile.controllers";
import { LoanController } from "../controllers/user/loan.controllers";
import { ApplicationController } from "../controllers/user/application.controllers";
import { UserLoanController } from "../controllers/user/user-loan.controllers";
import { PaymentController } from "../controllers/user/payment.controllers";
import { TransactionController } from "../controllers/user/transaction.controllers";
import { UserNotificationController } from "../controllers/user/user-notificationController";
import { UserChatController } from "../controllers/user/userChat.controllers";
import { authenticateUser } from "../middlewares/user-auth.middleware";
const authUserController = container.get<AuthUserController>(
  TYPES.AuthUserController
);
const profileController = container.get<ProfileController>(
  TYPES.ProfileController
);
const loanController = container.get<LoanController>(TYPES.LoanController);
const paymentController = container.get<PaymentController>(
  TYPES.PaymentController
);
const userLoanController = container.get<UserLoanController>(
  TYPES.UserLoanController
);
const applicationController = container.get<ApplicationController>(
  TYPES.ApplicationController
);
const transactionController = container.get<TransactionController>(
  TYPES.TransactionController
);
const userNotificationController = container.get<UserNotificationController>(
  TYPES.UserNotificationController
);
const userChatController = container.get<UserChatController>(
  TYPES.UserChatController
);
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
router.post(
  "/google-login",
  (req: Request, res: Response, next: NextFunction) =>
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
  "/change-password",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) =>
    authUserController.changePassword(req, res, next)
);

router.patch(
  "/update-profile-details",
  authenticateUser,
  authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) =>
    profileController.editProfile(req, res, next)
);
router.post("/logout", (req: Request, res: Response, next: NextFunction) =>
  authUserController.logout(req, res, next)
);

router.get(
  "/get-user",
  authenticateUser,authorizeRole(["user"]),
  
  (req: Request, res: Response, next: NextFunction) =>
    profileController.getUser(req, res, next)
);
router.post(
  "/complete-profile",
  authenticateUser,authorizeRole(["user"]),
  uploadFiles,
  (req: Request, res: Response, next: NextFunction) =>
    profileController.completeProfile(req, res, next)
);
router.get("/loans", (req: Request, res: Response, next: NextFunction) =>
  loanController.getLoans(req, res, next)
);
router.get(
  "/loan/:id",
  (req: Request, res: Response, next: NextFunction) =>
    loanController.getLoan(req, res, next)
);
router.get(
  "/get-interest/:loanId",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    loanController.getInterest(req, res, next);
  }
);

router.post(
  "/apply-loan",
  authenticateUser,authorizeRole(["user"]),
  uploadAdditionalDocs,
  (req: Request, res: Response, next: NextFunction) =>
    applicationController.createApplication(req, res, next)
);

router.get(
  "/applications",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    applicationController.getApplicationsByUserId(req, res, next);
  }
);

router.get(
  "/user-loans",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    userLoanController.getUserLoansByUserId(req, res, next);
  }
);

router.get(
  "/application/:applicationId/details",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    applicationController.getApplicationDetails(req, res, next);
  }
);

router.get(
  "/user-loan/emis/:userLoanId",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    userLoanController.getUserLoanEmis(req, res, next);
  }
);
router.get(
  "/razorpay/create-order/:userLoanId",
  authenticateUser,authorizeRole(["user"]), //
  (req: Request, res: Response, next: NextFunction) => {
    paymentController.createOrder(req, res, next);
  }
);
router.post(
  "/razorpay/verify-payment",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    paymentController.verifyRazorpayPayment(req, res, next);
  }
);
router.post(
  "/razorpay/payment/cancel",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    paymentController.cancelPaymentInitialisation(req, res, next);
  }
);

router.get( 
  "/transactions",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    transactionController.getTransactions(req, res, next);
  }
);

router.get(
  "/get-notifications",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    userNotificationController.getNotification(req, res, next);
  }
);

router.get(
  "/notifications-mark-read",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    userNotificationController.markUserNotificationsAsRead(req, res, next);
  }
);
router.get(
  "/total-unreaded",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    userNotificationController.totalUnreadNotifications(req, res, next);
  }
);

router.post(
  "/contact-us",
  (req: Request, res: Response, next: NextFunction) => {
    profileController.contactUs(req, res, next);
  }
);

router.get(
  "/get-chat",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    userChatController.getOrCreateChat(req, res, next);
  }
);

router.post(
  "/send-message",
  authenticateUser,authorizeRole(["user"]),
  (req: Request, res: Response, next: NextFunction) => {
    userChatController.sendMessage(req, res, next);
  }
);

export default router;
