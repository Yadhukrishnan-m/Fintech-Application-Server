import { Request, Response, NextFunction } from "express";
import { IProfileService } from "../../interfaces/services/user-profile.service.interface";
import { CustomError } from "../../utils/custom-error";
import { Express } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";

import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ILoanService } from "../../interfaces/services/loan.service.interface";
import { IUserLoanService } from "../../interfaces/services/user-loan.interface.interfaces";
import { IPaymentService } from "../../interfaces/services/payment.service.interface";
interface AuthenticatedRequest extends Request {
  userId: string;
}

@injectable()
export class PaymentController {
  constructor(
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService
  ) {}

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { userLoanId } = req.params;
      const { userId } = req as AuthenticatedRequest;
      const { orderId, totalAmount } = await this._paymentService.createOrder(
        userLoanId,
        userId
      );

      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.CREATED,
        success: true,
        orderId,
        totalAmount,
      });
    } catch (error) {
   
      next(error);
    }
  }

  async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userLoanId,
      } = req.body;
      const { userId } = req as AuthenticatedRequest;
      await this._paymentService.verifyPayment(
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userLoanId,
        userId
      );

      res.status(200).json({ message: "Payment verified and recorded" });
    } catch (error) {
      
      next(error);
    }
  }

  async cancelPaymentInitialisation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        
        userLoanId,
      } = req.body;
      const { userId } = req as AuthenticatedRequest;

await  this._paymentService.cancelInitialisation(userId,userLoanId)

      res.status(200).json({ message: "Payment cancelled " });
    } catch (error) {
      next(error);
    }
  }
}
