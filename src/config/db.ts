import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI: string | undefined = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI);

    console.log(" MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", (error as Error).message);
   
  }
};

export { connectDB};
