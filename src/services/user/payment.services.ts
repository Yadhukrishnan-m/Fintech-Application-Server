import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IUserLoan } from "../../models/user-loan.model";
import { IUserLoanRepository } from "../../interfaces/repositories/user-loan.repository.interface";
import { ITransaction } from "../../models/transaction.model";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
import { IEmiCalculator } from "../../interfaces/helpers/emiCalculator.service.interface";
import { IEmi } from "../../dtos/shared/emi.dto";
import { IPaymentService } from "../../interfaces/services/payment.service.interface";
import { log } from "node:console";
import { today } from "../../config/testDate";
import { IRazorpayService } from "../../interfaces/services/rezorpay.service.interface";
import { IRazorpayOrder } from "../helpers/razorpay.services";
import { TransactionModelMapper } from "../../utils/mappers/transaction-mapper";
@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(TYPES.UserLoanRepository)
    private _userLoanRepository: IUserLoanRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmiCalculator) private _emiCalculator: IEmiCalculator,
    @inject(TYPES.RazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository
  ) {}

  async createOrder(
    userLoanId: string
  ): Promise<{ orderId: string; totalAmount: number }> {
    const userLoan: IUserLoan | null = await this._userLoanRepository.findById(
      userLoanId
    );
    if (!userLoan) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    // Fetch past transactions
    const transactions: ITransaction[] | null =
      await this._transactionRepository.getUserLoanTransactions(userLoanId);

    // Calculate EMI details
    const principalAmount = userLoan.amount;
    const annualInterestRate = userLoan.interest;
    const tenure = userLoan.tenure;

    const { emi, principalPerMonth, monthlyInterest } =
      this._emiCalculator.calculateEmi(
        principalAmount,
        annualInterestRate,
        tenure
      );

    //   const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the next EMI number to pay
    let nextEmiNumber = 1;
    if (transactions) {
      nextEmiNumber = transactions.length + 1;
    }

    if (nextEmiNumber > tenure) {
      throw new CustomError(
        "All EMIs are already paid",
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Determine the next EMI's due date
    const rawDueDate = new Date(userLoan.nextDueDate);
    const nextDueDate = new Date(
      rawDueDate.getUTCFullYear(),
      rawDueDate.getUTCMonth(),
      rawDueDate.getUTCDate()
    );
    nextDueDate.setMonth(nextDueDate.getMonth() + (nextEmiNumber - 1));
    nextDueDate.setHours(0, 0, 0, 0);

    // Calculate grace period end date
    const gracePeriodEndDate = new Date(nextDueDate);
    gracePeriodEndDate.setDate(
      gracePeriodEndDate.getDate() + userLoan.gracePeriod
    );
    gracePeriodEndDate.setHours(23, 59, 59, 999);

    // Determine penalty
    let penalty = 0;
    if (today > nextDueDate && today > gracePeriodEndDate) {
      penalty = this._emiCalculator.calculatePenalty(
        principalPerMonth,
        userLoan.duePenalty,
        gracePeriodEndDate,
        today
      );
    }

    const totalAmount = Number(
      (principalPerMonth + monthlyInterest + penalty).toFixed(2)
    );

    const order = await this._razorpayService.createOrder(totalAmount);

    return {
      orderId: order.id,
      totalAmount,
    };
  }

  async verifyPayment(
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string,
    userLoanId: string,
    userId:string
  ): Promise<void> {
    // to find the amounts of payment
    const userLoan: IUserLoan | null = await this._userLoanRepository.findById(
      userLoanId
    );
    if (!userLoan) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    // Fetch past transactions
    const transactions: ITransaction[] | null =
      await this._transactionRepository.getUserLoanTransactions(userLoanId);

    // Calculate EMI details
    const principalAmount = userLoan.amount;
    const annualInterestRate = userLoan.interest;
    const tenure = userLoan.tenure;

    const { emi, principalPerMonth, monthlyInterest } =
      this._emiCalculator.calculateEmi(
        principalAmount,
        annualInterestRate,
        tenure
      );

    //   const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the next EMI number to pay
    let nextEmiNumber = 1;
    if (transactions) {
      nextEmiNumber = transactions.length + 1;
    }

    if (nextEmiNumber > tenure) {
      throw new CustomError(
        "All EMIs are already paid",
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Determine the next EMI's due date
    const rawDueDate = new Date(userLoan.nextDueDate);
    const nextDueDate = new Date(
      rawDueDate.getUTCFullYear(),
      rawDueDate.getUTCMonth(),
      rawDueDate.getUTCDate()
    );
    nextDueDate.setMonth(nextDueDate.getMonth() + (nextEmiNumber - 1));
    nextDueDate.setHours(0, 0, 0, 0);

    // Calculate grace period end date
    const gracePeriodEndDate = new Date(nextDueDate);
    gracePeriodEndDate.setDate(
      gracePeriodEndDate.getDate() + userLoan.gracePeriod
    );
    gracePeriodEndDate.setHours(23, 59, 59, 999);

    // Determine penalty
    let penalty = 0;
    if (today > nextDueDate && today > gracePeriodEndDate) {
      penalty = this._emiCalculator.calculatePenalty(
        principalPerMonth,
        userLoan.duePenalty,
        gracePeriodEndDate,
        today
      );
    }

    const totalAmount = Number(
      (principalPerMonth + monthlyInterest + penalty).toFixed(2)
    );
   
    if (!razorpay_order_id) {
      throw new CustomError(MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      const transactionData = {
        transactionId: razorpay_order_id,
        userId: userId,
        userLoanId: userLoanId,
        amount: totalAmount,
        interestAmount: monthlyInterest,
        penaltyAmount: penalty,
        paymentStatus: "failed" as "failed",
        type: "emi" as "emi",
      };
      const transaction=TransactionModelMapper.toModel(transactionData)
      await this._transactionRepository.create(transaction);

      throw new CustomError(MESSAGES.TRANSACTION_FAILED, STATUS_CODES.PAYMENT_REQUIRED);
  
    }

        await this._razorpayService.verifyPayment(
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
            );

      const transactionData = {
        transactionId: razorpay_payment_id,
        userId: userId,
        userLoanId: userLoanId,
        amount: totalAmount,
        interestAmount: monthlyInterest,
        penaltyAmount: penalty,
        paymentStatus: "completed" as "completed",
        type: "emi" as "emi",
      };
      const transaction = TransactionModelMapper.toModel(transactionData);
      await this._transactionRepository.create(transaction);
  }
}
 