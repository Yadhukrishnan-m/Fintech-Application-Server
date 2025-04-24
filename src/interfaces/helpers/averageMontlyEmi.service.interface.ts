export interface IAverageMontlyEmi {
  findAverageEmi(userId:string): Promise<number>;
}
