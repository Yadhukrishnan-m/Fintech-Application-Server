import { IBaseRepository } from "./base.repository.interface";
import { ICapital } from "../../models/capital.model";
export interface ICapitalRepository extends IBaseRepository<ICapital> {
  incBalance(amount: number): Promise<ICapital>;
   decBalance(amount: number): Promise<ICapital> 
}
   