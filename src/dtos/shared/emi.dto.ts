export interface IEmi {
  emiNumber: number;
  amount: number;
  dueDate: Date;
  status: "paid" | "upcoming" | "grace" | "overdue" | "due";
  penalty: number;
  transaction: any | null;
  canPay: boolean;
}
