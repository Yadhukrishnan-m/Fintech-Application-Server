

export interface IRazorpayService {
  createOrder(amount: number): Promise<any>;
  verifyPayment(
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string
  ): Promise<
    { paymentStatus: string; razorpay_order_id: string } | void
  >;
}
