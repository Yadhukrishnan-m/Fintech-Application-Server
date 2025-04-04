import express from 'express'
import userRoutes from './routes/user.route'
import adminRoutes from './routes/admin.route'
import { ErrorHandler} from './middlewares/error-handle.middleware'
import cookieParser from "cookie-parser";

const app=express()
app.use(cookieParser());
import cors from "cors";
import logger from './utils/logger';
import morgan from 'morgan';
import { initializeSocket } from './config/socket';
import { container } from './config/inversify/inversify.config';
import { EmiReminderService } from './services/helpers/nofify-usersforoverdue.services';
import { TYPES } from './config/inversify/inversify.types';
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);
container.get<EmiReminderService>(TYPES.EmiReminderService);

app.use(morgan("dev"));
app.use(express.json())
app.use(logger)
app.use('/',userRoutes)
app.use("/admin", adminRoutes);


// global error handlint middleware
app.use(ErrorHandler.handleError);
export default app