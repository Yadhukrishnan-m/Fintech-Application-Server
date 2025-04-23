import mongoose, { Document, Schema } from "mongoose";
export interface ICapital extends Document {
  availableBalance: Number;
}
const CapitalSchema = new Schema<ICapital>(
  {
    availableBalance: { type: Number, required: true },
  },
  { collection: "capital" }
);
const CapitalModel = mongoose.model<ICapital>("Capital", CapitalSchema);
export default CapitalModel;