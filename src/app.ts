import express from 'express'
import userRoutes from './routes/user.route'
import adminRoutes from './routes/admin.route'
import { ErrorHandler} from './middlewares/error-handle.middleware'
import cookieParser from "cookie-parser";
import morgan from "morgan";
const app=express()
app.use(cookieParser());
import cors from "cors";
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.use(express.json())
app.use(morgan("dev"));
app.use('/',userRoutes)
app.use("/admin", adminRoutes);


// global error handlint middleware
app.use(ErrorHandler.handleError);
export default app