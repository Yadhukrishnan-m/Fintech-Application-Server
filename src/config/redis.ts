import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD as string,
  socket: {
    host: process.env.REDIS_HOST as string,
    port: Number(process.env.REDIS_PORT),
    
  },
});

redisClient.on("error", (err) => console.error(" Redis Client Error:", err));

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log(" Connected to Redis Cloud");
  } catch (error) {
    console.error(" Redis Cloud Connection Failed:", error);
  }
};

export { connectRedis, redisClient };
