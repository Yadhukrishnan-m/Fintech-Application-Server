import { IEmi } from "../../dtos/shared/emi.dto";
import { ILoan } from "../../models/loan.model";
import { IUserLoan } from "../../models/user-loan.model";

export interface IPaymentService {
  createOrder(
    userLoanId: string
  ): Promise<{ orderId: string; totalAmount: number }>;
  verifyPayment(
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string,
    userLoanId: string,
    userId:string
  ): Promise<void>;
}
