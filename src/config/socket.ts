import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;
export const userSocketMap = new Map<string, string>(); // Store userId → socketId mapping

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register_user", (userId: string) => {
      userSocketMap.set(userId, socket.id);

      socket.join(userId);
    });

    socket.on("joinRoom", (roomId) => {
      console.log(roomId)
      console.log(`User joined room: ${roomId}`);
      socket.join(roomId);
    });
    
    socket.on("sendMessage", ({ roomId, message, userId}) => {
      console.log(`Message sent to room ${roomId}:`, message);
      const createdAt = new Date ();
      /**
       * 
       */

      io.to(roomId).emit("receiveMessage", {
        content: message,
        sender_id: userId,
        createdAt,
        chat_id: roomId,
      });

      // ✅ Send to room
    });


    // socket.on("register_chat", (userId: string) => {
    //   console.log(`User ${userId} joined chat  ${userId}`);
    //   userSocketMap.set(userId, socket.id);
    //   socket.join(userId);

    // });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (let [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const getUserSocket = (userId: string) => {
  return userSocketMap.get(userId); // Get user's socket ID
};
