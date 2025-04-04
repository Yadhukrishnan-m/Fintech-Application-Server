import { Model, Document } from "mongoose";
import { IBaseRepository } from "../interfaces/repositories/base.repository.interface";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const newRecord = new this.model(data);
    return await newRecord.save();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findAll(): Promise<T[]> {
    return await this.model.find();
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async findOne(query: any): Promise<T | null> {
    return await this.model.findOne(query);
  }
  async find(query: any): Promise<T[]> {
    return await this.model.find(query);
  }
}
