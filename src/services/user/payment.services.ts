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
import { ICapitalRepository } from "../../interfaces/repositories/capital.repository.interface";
import { redisClient } from "../../config/redis";

@injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @inject(TYPES.UserLoanRepository)
    private _userLoanRepository: IUserLoanRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmiCalculator) private _emiCalculator: IEmiCalculator,
    @inject(TYPES.RazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository,
    @inject(TYPES.CapitalRepository)
    private _capitalRepository: ICapitalRepository
  ) {}

  async createOrder(
    userLoanId: string,
    userId: string
  ): Promise<{ orderId: string; totalAmount: number }> {
    const userLoan: IUserLoan | null = await this._userLoanRepository.findById(
      userLoanId
    );
    if (!userLoan) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const redisKey = `payment_lock_${userLoan._id}_${userId}`;
    const existing = await redisClient.get(redisKey);
    if (existing) {
      throw new CustomError(
        MESSAGES.PAYMENT_IN_PROGRESS,
        STATUS_CODES.BAD_REQUEST
      );
    }
    await redisClient.set(redisKey, "true", {
      EX: Number(process.env.INITIATED_PAYMENT_EXPIRY || 300),
    });

    // Fetch past transactions
    const transactions: ITransaction[] | null =
      await this._transactionRepository.getUserLoanTransactions(userLoanId);

    // Calculate EMI details correctly
    const principalAmount = userLoan.amount;
    const annualInterestRate = userLoan.interest;
    const tenure = userLoan.tenure;

    const { emi } = this._emiCalculator.calculateEmi(
      principalAmount,
      annualInterestRate,
      tenure
    );

    // Define today's date
    // const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the next EMI number to pay
    let nextEmiNumber = transactions ? transactions.length + 1 : 1;

    if (nextEmiNumber > tenure) {
      throw new CustomError(
        "All EMIs are already paid",
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Calculate the due date for the next EMI
    const rawDueDate = new Date(userLoan.createdAt);
    const nextDueDate = new Date(rawDueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + nextEmiNumber);
    nextDueDate.setDate(rawDueDate.getDate());
    nextDueDate.setHours(0, 0, 0, 0);

    // Calculate the grace period end date
    const gracePeriodEndDate = new Date(nextDueDate);
    gracePeriodEndDate.setDate(
      gracePeriodEndDate.getDate() + userLoan.gracePeriod
    );
    gracePeriodEndDate.setHours(23, 59, 59, 999);

    // Determine penalty
    let penalty = 0;
    let emiStatus: "due" | "grace" | "overdue" | "paid" | "upcoming" =
      "upcoming";

    if (today < nextDueDate) {
      emiStatus = "upcoming";
    } else if (today.getTime() === nextDueDate.getTime()) {
      emiStatus = "due";
    } else if (today > nextDueDate && today <= gracePeriodEndDate) {
      emiStatus = "grace";
    } else if (today > gracePeriodEndDate) {
      emiStatus = "overdue";
      penalty = this._emiCalculator.calculatePenalty(
        emi,
        userLoan.duePenalty,
        gracePeriodEndDate,
        today
      );
    }

    if (emiStatus === "upcoming") {
      throw new CustomError(
        "EMI payment is not due yet",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const totalAmount = Number((emi + penalty).toFixed(2));

    // Create order with the calculated amount
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
    userId: string
  ): Promise<void> {
    const userLoan: IUserLoan | null = await this._userLoanRepository.findById(
      userLoanId
    );
    if (!userLoan) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    // Fetch past transactions
    const transactions: ITransaction[] | null =
      await this._transactionRepository.getUserLoanTransactions(userLoanId);

    // Calculate EMI details correctly
    const principalAmount = userLoan.amount;
    const annualInterestRate = userLoan.interest;
    const tenure = userLoan.tenure;

    const { emi, monthlyInterest } = this._emiCalculator.calculateEmi(
      principalAmount,
      annualInterestRate,
      tenure
    );

    // Define today's date
    // const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the next EMI number to pay
    let nextEmiNumber = transactions ? transactions.length + 1 : 1;

    if (nextEmiNumber > tenure) {
      throw new CustomError(
        "All EMIs are already paid",
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Calculate the due date for the next EMI
    const rawDueDate = new Date(userLoan.createdAt);
    const nextDueDate = new Date(rawDueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + nextEmiNumber);
    nextDueDate.setDate(rawDueDate.getDate());
    nextDueDate.setHours(0, 0, 0, 0);

    // Calculate the grace period end date
    const gracePeriodEndDate = new Date(nextDueDate);
    gracePeriodEndDate.setDate(
      gracePeriodEndDate.getDate() + userLoan.gracePeriod
    );
    gracePeriodEndDate.setHours(23, 59, 59, 999);

    // Determine penalty
    let penalty = 0;
    let emiStatus: "due" | "grace" | "overdue" | "paid" | "upcoming" =
      "upcoming";

    if (today < nextDueDate) {
      emiStatus = "upcoming";
    } else if (today.getTime() === nextDueDate.getTime()) {
      emiStatus = "due";
    } else if (today > nextDueDate && today <= gracePeriodEndDate) {
      emiStatus = "grace";
    } else if (today > gracePeriodEndDate) {
      emiStatus = "overdue";
      penalty = this._emiCalculator.calculatePenalty(
        emi,
        userLoan.duePenalty,
        gracePeriodEndDate,
        today
      );
    }

    // Correct EMI total calculation
    const totalAmount = Number((emi + penalty).toFixed(2));

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
      const transaction = TransactionModelMapper.toModel(transactionData);
      await this._transactionRepository.create(transaction);

    const redisKey = `initiated:${userLoan._id}:${userId}`;
    await redisClient.del(redisKey);
    throw new CustomError(MESSAGES.PAYMENT_FAILED,STATUS_CODES.BAD_REQUEST)
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
      createdAt: today,
    };
    const transaction = TransactionModelMapper.toModel(transactionData);
    await this._transactionRepository.create(transaction);
    await this._capitalRepository.incBalance(totalAmount);
    const finscore = await this._userRepository.findFinscore(userId);
    if (finscore == null) {
      return;
    }
    let increaseBy = 0;
    if (emiStatus == "due") {
      increaseBy = 5;
    } else if (emiStatus == "grace") {
      increaseBy = 2;
    }
    const updatedFinscore = Math.min(finscore + increaseBy, 100);
    await this._userRepository.updateById(userId, {
      finscore: updatedFinscore,
    });
    if (nextEmiNumber === tenure) {
      await this._userLoanRepository.updateById(userLoanId, {
        status: "closed",
      });
    }

       const redisKey = `payment_lock_${userLoan._id}_${userId}`;

    await redisClient.del(redisKey);
  }

  async cancelInitialisation(
    userId: string,
    userLoanId:string
  ): Promise<void> {
    console.log(userLoanId,userId);
    

        const redisKey = `payment_lock_${userLoanId}_${userId}`;

    await redisClient.del(redisKey);

  }
}
 