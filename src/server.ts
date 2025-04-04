import { createServer } from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";
import { initializeSocket } from "./config/socket";
const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis()
    const server = createServer(app);

    
    initializeSocket(server);
    server.listen(port, () => {
      console.log(` Server started successfully on port ${port}`);
    });
  } catch (error) {
    console.error(" Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
