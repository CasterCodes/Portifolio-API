import express from "express";
import dotenv from "dotenv";

import postRoutes from "./routes/postRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import usersRoutes from "./routes/userRoutes.js";
import AppError from "./utils/appError.js";
import globalError from "./middleware/globalError.js";
import cookieParser from "cookie-parser";
import rateLimiter from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import compression from "compression";
import path from "path";

const app = express();

dotenv.config();

app.get("/", (req, res) => {
  res.status(200).send("HELLO WORD");
});
const limiter = rateLimiter({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "To many requests from this ip address ! Please try again in hour",
});
// middlewares
// express-rate-limit to limit the number of requests from a single ip address
// app.use("/api", limiter);

// data sanitization and cleaning against noSQL injections
// app.use(mongoSanitize());

// data sanitization against XSS attacks
// app.use(xss());

app.use(express.json({ extended: true, limit: "10kb" }));

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// app.use(express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

// app.use(helmet());

// app.use(compression);

// routes
app.use("/api/blogs", postRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/users", usersRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server`, 404));
});

app.use(globalError);

export default app;
