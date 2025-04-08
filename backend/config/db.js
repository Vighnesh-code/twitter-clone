import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `MongoDB Connection Successful on host: ${conn.connection.host}`
    );
  } catch (error) {
    console.log(`Failed to connect to the Database`);
  }
};
