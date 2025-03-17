import express, { NextFunction, Request, Response } from "express";
import {
  authAdminController,
  userManagementController,
} from "../config/admin.di";



const router = express.Router();

router.post("/login", (req: Request, res: Response, next: NextFunction) =>
  authAdminController.login(req, res, next)
);
router.post("/logout", (req: Request, res: Response, next: NextFunction) =>
  authAdminController.logout(req, res, next)
);
router.get(
  "/unverified-users",
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.getUnverifiedUsers(req, res, next)
);
router.get(
  "/verified-users",
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.getVerifiedUsers(req, res, next)
);
router.get(
  "/user/:id",
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.getUserById(req, res, next)
);

router.patch("/verify-user/:id", (req: Request, res: Response, next: NextFunction) =>
  userManagementController.verifyUser(req, res, next)
);
router.patch(
  "/blacklist-user/:id",
  (req: Request, res: Response, next: NextFunction) =>
    userManagementController.blacklistUser(req, res, next)
);

export default router;
