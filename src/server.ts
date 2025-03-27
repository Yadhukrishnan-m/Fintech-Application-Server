import app from "./app";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";
const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis()
    app.listen(port, () => {
      console.log(` Server started successfully on port ${port}`);
    });
  } catch (error) {
    console.error(" Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
