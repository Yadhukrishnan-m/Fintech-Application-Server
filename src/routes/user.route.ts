import express, { NextFunction, Request, Response } from "express";
import { authUserController,profilecontroller } from "../config/user.di";
import { authenticateUser } from "../middlewares/user-auth.middleware";
import { uploadFiles } from "../middlewares/multer.middleware";

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
router.post(
  "/logout",
  (req: Request, res: Response, next: NextFunction) =>
    authUserController.logout(req, res, next)
);

router.get("/get-user",authenticateUser, (req: Request, res: Response, next: NextFunction) =>
  profilecontroller.getUser(req, res, next)
);
router.post(
  "/complete-profile",
  authenticateUser,uploadFiles,
  (req: Request, res: Response, next: NextFunction) =>
    profilecontroller.completeProfile(req, res, next)
);
export default router;
