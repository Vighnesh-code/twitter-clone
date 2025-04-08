import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./config/db.js";
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  connectDB();
  console.log(`Server Running on Port: ${port}`);
});
