import express, { NextFunction, Request, Response } from "express";
import { authorizeRole } from "../middlewares/roleAuth";
import { TYPES } from "../config/inversify/inversify.types";
import { AuthAdminController } from "../controllers/admin/auth-admin.controllers";
import { container } from "../config/inversify/inversify.config";
import { UserManagementController } from "../controllers/admin/user-management.controllers";
import { LoanManagementController } from "../controllers/admin/loan-management.controllers";
import { uploadLoanImage } from "../middlewares/multer.middleware";
import { ApplicationManagementController } from "../controllers/admin/application-management.controllers";
import { CapitalAndTransactionController } from "../controllers/admin/capital-transaction.controllers";
import { UserLoanManagementController } from "../controllers/admin/user-loan-management.controllers";
import { NotificationController } from "../controllers/admin/notification.controllers";
import { AdminChatController } from "../controllers/admin/adminChat.controllers";
import { DashboardController } from "../controllers/admin/dashboard.controllers";
import { authenticateAdmin } from "../middlewares/admin-auth.middleware";

const authAdminController = container.get<AuthAdminController>(
  TYPES.AuthAdminController
);
const userManagementController = container.get<UserManagementController>(
  TYPES.UserManagementController
);
const loanManagementController = container.get<LoanManagementController>(
  TYPES.LoanManagementController
);
const adminChatController=container.get<AdminChatController>(TYPES.AdminChatController)

const notificationController=container.get<NotificationController>(TYPES.NotificationController)
const userLoanManagementController=container.get<UserLoanManagementController>(TYPES.UserLoanManagementController)
const applicationManagementControlelr=container.get<ApplicationManagementController>(TYPES.ApplicationManagementController)
const capitalAndTransaction =container.get<CapitalAndTransactionController>(TYPES.CapitalAndTransactionController)
const dashboardController = container.get<DashboardController>(
  TYPES.DashboardController
);

  container.get<ApplicationManagementController>(
    TYPES.ApplicationManagementController
  );

const router = express.Router();

router.post("/login", (req: Request, res: Response, next: NextFunction) =>
{   authAdminController.login(req, res, next)}
);
router.post("/logout", (req: Request, res: Response, next: NextFunction) =>
  authAdminController.logout(req, res, next)
);
router.get(
  "/unverified-users",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.getUnverifiedUsers(req, res, next)
);
router.get(
  "/verified-users",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.getVerifiedUsers(req, res, next)
);

router.post(
  "/refresh-token",
  (req: Request, res: Response, next: NextFunction) =>
    authAdminController.refreshToken(req, res, next)
);
router.get(
  "/user/:id",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.getUserById(req, res, next)
);

router.patch(
  "/verify-user/:id",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.verifyUser(req, res, next)
);
router.patch(
  "/blacklist-user/:id",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.blacklistUser(req, res, next)
);
router.post(
  "/create-loan",
  authenticateAdmin,authorizeRole(["admin"]),
  uploadLoanImage,
  (req: Request, res: Response, next: NextFunction) =>
    loanManagementController.createLoan(req, res, next)
);
router.get(
  "/loans",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    loanManagementController.getLoans(req, res, next)
);
router.patch(
  "/loans/:loanId/toggle-status",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    loanManagementController.toggleLoanStatus(req, res, next)
);

router.get(
  "/loan/:loanId",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    loanManagementController.getLoan(req, res, next)
);
router.put(
  "/update-loan/:loanId",
  authenticateAdmin,authorizeRole(["admin"]),uploadLoanImage,
  (req: Request, res: Response, next: NextFunction) =>
    loanManagementController.updateLoan(req, res, next)
);
router.get(
  "/applications",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    applicationManagementControlelr.getApplications(req, res, next)
);

router.get(
  "/application/:applicationId",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    applicationManagementControlelr.getApplication(req, res, next)
);

router.patch(
  "/verify-application/:applicationId",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) =>
    applicationManagementControlelr.verifyApplication(req, res, next)
);

router.get(
  "/transactions",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    capitalAndTransaction.getTransactions(req, res, next);
  }
);

router.post(
  "/add-capital",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    capitalAndTransaction.addCapital(req, res, next);
  }
);
router.get(
  "/get-capital",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    capitalAndTransaction.getcapital(req, res, next);
  }
);

router.get(
  "/get-userloan",
  // authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    userLoanManagementController.getUserLoans(req, res, next);
  }
);

router.get(
  "/user-loan/emis/:userLoanId",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    userLoanManagementController.getUserLoanEmis(req, res, next);
  }
);

router.get(
  "/user/user-loans/:userId",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    userLoanManagementController.getUserLoansOfSingleUser(req, res, next);
  }
);
router.post (
  "/create-notification",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    notificationController.createNotification(req, res, next);
  }
);

router.get(
  "/all-chats",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
  adminChatController.getAllChats(req, res, next);
  }
);

router.post(
  "/send-message",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    adminChatController.sendMessage(req, res, next);
  }
);

router.get(
  "/get-chat/:userId",
  authenticateAdmin,authorizeRole(["admin"]),
  (req: Request, res: Response, next: NextFunction) => {
    adminChatController.getOrCreateChat(req, res, next);
  }
);


router.get(
  "/dashboard/get-totals",
  authenticateAdmin,authorizeRole(["admin"]),

  (req: Request, res: Response, next: NextFunction) => {
    dashboardController.getTotals(req, res, next);
  }
);

router.get(
  "/dashboard/application-chart/:timeFrame",
  authenticateAdmin,authorizeRole(["admin"]),

  (req: Request, res: Response, next: NextFunction) => {
    dashboardController.applicationChart(req, res, next);
  }
);
router.get(
  "/dashboard/transaction-chart/:timeFrame",
  authenticateAdmin,authorizeRole(["admin"]),

  (req: Request, res: Response, next: NextFunction) => {
    dashboardController.transactionChart(req, res, next);
  }
);

router.post(
  "/dashboard/report/:documentType",
  (req: Request, res: Response, next: NextFunction) => {
    dashboardController.downloadReport(req, res, next);
  }
);


export default router;
 