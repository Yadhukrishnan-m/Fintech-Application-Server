import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
    _id:string
  email: string;
  password: string;
  createdAt?: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "admin" }
);

const AdminModel = mongoose.model<IAdmin>("Admin", AdminSchema);
export default AdminModel;
