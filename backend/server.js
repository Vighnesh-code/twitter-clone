import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json()); // to parse request body
app.use(express.urlencoded({ extended: true })); // to parse form data (urlencoded)
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  connectDB();
  console.log(`Server Running on Port: ${port}`);
});
