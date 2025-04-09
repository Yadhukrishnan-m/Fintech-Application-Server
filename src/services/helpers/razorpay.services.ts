import Razorpay  from "razorpay";
import { injectable } from "inversify";
import { IRazorpayService } from "../../interfaces/services/rezorpay.service.interface";
import crypto from "crypto";
import { CustomError } from "../../utils/custom-error";
import { STATUS_CODES } from "../../config/constants/status-code";

export interface IRazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  receipt: string | null;
  offer_id: string | null;
  created_at: number;
  attempts: number;
  
}
export interface IRazorpayPayment {
  id: string;
  entity: string;
  amount: number |string; // Ensure it's always a number
  currency: string;
  status: string;
  order_id: string | null;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded?: number |null; // Ensure it's always a number
  refund_status: string | null;
  captured: boolean;
  description?: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string |number; // Ensure it's always a string
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  created_at: number;
}


@injectable()
export class RazorpayService implements IRazorpayService {
  private _razorpay: Razorpay; // Declare the property

  constructor() {
    this._razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amount: number): Promise<IRazorpayOrder> {
 
    const options = {
      amount: Number(amount * 100).toFixed(0), // Convert amount to paise
      currency: "INR",
    };

    const order = await this._razorpay.orders.create(options);

    return {
      id: order.id,
      entity: order.entity,
      amount: Number(order.amount),
      amount_paid: Number(order.amount_paid),
      amount_due: Number(order.amount_due),
      currency: order.currency,
      status: order.status,
      receipt: order.receipt ?? null,
      offer_id: order.offer_id ?? null,
      created_at: order.created_at,
      attempts: order.attempts,
    };
  }
  async verifyPayment(
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string
  ): Promise<
    { paymentStatus: string; razorpay_order_id: string } | void
  > {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return { paymentStatus: "failed", razorpay_order_id };
    }
  }
}
