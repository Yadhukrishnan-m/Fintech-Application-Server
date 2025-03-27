import fs from "fs";
import path from "path";
import morgan from "morgan";
import cron from "node-cron";
// import { fileURLToPath } from "url";

// // Get __dirname equivalent in ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// eslint-disable-next-line no-undef
const logFilePath = path.join(__dirname, "..", "requests.log");

// Create a write stream for logging
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

// Morgan middleware to log requests
const logger = morgan("combined", { stream: logStream });

// Cron job to delete the log file every 7 days
cron.schedule("0 0 */7 * *", () => {
  if (fs.existsSync(logFilePath)) {
    fs.unlink(logFilePath, (err) => {
      if (err) {
        console.error("Error deleting log file:", err);
      } else {
        console.log("Log file deleted and restarted.");
      }
    });
  }
});

export default logger;
