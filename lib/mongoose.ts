import mongoose from "mongoose";
// variable to check if mongoose is connected
let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("MONGODB_URL NOT FOUND");
  if (isConnected) return console.log("Already connected");
  try {
    await mongoose.connect(process.env.MONGODB_URL, { dbName: "threads" });
    isConnected = true;
    console.log("Connected to mongodb");
  } catch (e) {
    console.log(e);
  }
};
