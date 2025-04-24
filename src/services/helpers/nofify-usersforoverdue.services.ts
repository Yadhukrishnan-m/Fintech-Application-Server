
import { IUserLoanRepository } from "../../interfaces/repositories/user-loan.repository.interface";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IEmiCalculator } from "../../interfaces/helpers/emiCalculator.service.interface";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { today } from "../../config/testDate";
import { ITransaction } from "../../models/transaction.model";
import { CustomError } from "../../utils/custom-error";
import cron from "node-cron";
import { IEmailService } from "../../interfaces/helpers/email-service.service.interface";
@injectable()
export class EmiReminderService {
  constructor(
    @inject(TYPES.UserLoanRepository)
    private _userLoanRepository: IUserLoanRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.EmiCalculator) private _emiCalculator: IEmiCalculator,
    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository,
     @inject(TYPES.EmailService) private _emailService: IEmailService,
  ) {

     this.scheduleEmiReminderJob();
  }
  async notifyUsersForOverdueEMIs(): Promise<void> {
    const allUserLoans = await this._userLoanRepository.findAll();

    for (const userLoan of allUserLoans) {
      const transactions: ITransaction[] | null =
        await this._transactionRepository.getUserLoanTransactions(
          userLoan._id.toString()
        );
 const user=await this._userRepository.findById(userLoan.userId.toString())
 
    const principalAmount = userLoan.amount;
    const annualInterestRate = userLoan.interest;
    const tenure = userLoan.tenure;
    const { emi, monthlyInterest, principalPerMonth } =
      this._emiCalculator.calculateEmi(
        principalAmount,
        annualInterestRate,
        tenure
      );

    // const today = new Date("2025-04-30"); // for testing phace give dates for testing
    // const today=new Date()
    today.setHours(0, 0, 0, 0);

    const emiSchedule = [];

    const rawDueDate = new Date(userLoan.createdAt); // Get the loan creation date
    const startingDueDate = new Date(rawDueDate); // Clone the original date
    startingDueDate.setHours(0, 0, 0, 0);
    startingDueDate.setMonth(startingDueDate.getMonth() + 1);

    let hasUnpaidEMI = false;

    const paidTransactions = new Map();
    let count = 1;
    if (transactions) {
      transactions.forEach((tx) => {
        paidTransactions.set(count++, tx);
      });
    }

    for (let i = 1; i <= tenure; i++) {
      const thisEmiDueDate = new Date(startingDueDate);
      thisEmiDueDate.setMonth(thisEmiDueDate.getMonth() + (i - 1));
      thisEmiDueDate.setHours(0, 0, 0, 0);

      const isPaid = paidTransactions.has(i);
      let emiStatus: "paid" | "upcoming" | "due" | "grace" | "overdue" =
        "upcoming";
      let penalty = 0;
      let canPay = false;

      const gracePeriodEndDate = new Date(thisEmiDueDate);
      gracePeriodEndDate.setDate(
        gracePeriodEndDate.getDate() + userLoan.gracePeriod
      );
      gracePeriodEndDate.setHours(23, 59, 59, 999);

      const isExactDueDate =
        today.getDate() === thisEmiDueDate.getDate() &&
        today.getMonth() === thisEmiDueDate.getMonth() &&
        today.getFullYear() === thisEmiDueDate.getFullYear();

      if (isPaid) {
        emiStatus = "paid";

        penalty = isPaid ? paidTransactions.get(i)?.penaltyAmount || 0 : 0;
      } else if (today < thisEmiDueDate) {
        emiStatus = "upcoming";
      } else if (isExactDueDate) {
        emiStatus = "due";
        canPay = !hasUnpaidEMI;
      } else if (today > thisEmiDueDate && today <= gracePeriodEndDate) {
        emiStatus = "grace";
        canPay = !hasUnpaidEMI;
      } else {
        emiStatus = "overdue";

        penalty = this._emiCalculator.calculatePenalty(
          emi,
          userLoan.duePenalty,
          gracePeriodEndDate,
          today
        );
        canPay = !hasUnpaidEMI;
        hasUnpaidEMI = true;
      }

      emiSchedule.push({
        emiNumber: i,
        amount: emi,
        dueDate: new Date(thisEmiDueDate),
        gracePeriodEndDate: new Date(gracePeriodEndDate),
        status: emiStatus,
        penalty: penalty,
        transaction: isPaid ? paidTransactions.get(i) : null,
        canPay: canPay,
      });
                                                                     

const overdueCount = emiSchedule.filter(
  (emi) => emi.status === "overdue"
).length;

const totalPenalty = emiSchedule.reduce(
  (sum, emi) => (emi.status === "overdue" ? sum + emi.penalty : sum),
  0
);
if (!user) {
    continue
}
if (overdueCount>0) {
   const content = this._emailService.generateOverdueEmiEmailContent(
     user,
     userLoan,
     overdueCount,
     totalPenalty
   );
   await this._emailService.sendEmail(
     user.email,
     "Warning! Pending  Emi Not Paid",
     content
   );
  
}
              
}
 }
  } 
   
  private scheduleEmiReminderJob() {
    cron.schedule(
    " 0 22 * * * ",
      async () => {
        try {
          console.log("Running scheduled EMI reminder job...");
          await this.notifyUsersForOverdueEMIs();
        } catch (error) {
          console.error("Error in EMI reminder job:", error);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      }
    );
  }
}
 