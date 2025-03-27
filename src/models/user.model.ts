import mongoose, { Schema, Document } from "mongoose";

// Define an interface for the User document
export interface IUser extends Document {
  _id: string;
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  job?: string;
  income?: number;
  finscore?: number;
  gender?: "male" | "female" | "other";
  password?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  cibilScore?: number;
  aadhaarDoc?: string;
  panDoc?: string;
  cibilDoc?: string;
  additionalDoc?: string;
  isBlacklisted?: boolean;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the User schema
const UserSchema = new Schema<IUser>(
  {
    customerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number },
    dob: { type: String },
    job: { type: String },
    income: { type: Number },
    finscore: { type: Number, default: 0 },
    gender: { type: String, enum: ["male", "female", "other"] },
    password: { type: String },
    aadhaarNumber: { type: String },
    panNumber: { type: String},
    cibilScore: { type: Number },
    aadhaarDoc: { type: String },
    panDoc: { type: String },
    cibilDoc: { type: String },
    additionalDoc: { type: String },
    isBlacklisted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "completed", "verified", "rejected"],
      default: "pending",
    },
    // createdAt: { type: Date, default: Date.now },
  },
  { collection: "users", timestamps: true } 
);

// Create and export the User model
export const UserModel = mongoose.model<IUser>("User", UserSchema);
