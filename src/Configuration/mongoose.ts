import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.DATABASE_URL as string;
  try {
    
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 3000,
      maxPoolSize: 10,
    });
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
  }
};

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("reconnected", () => {
  console.log("Reconnected to MongoDB");
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
  setTimeout(connectDB, 5000); // Attempt to reconnect after 5 seconds
});

mongoose.connection.on("error", (error) => {
  console.error(`MongoDB connection error: ${error}`);
});


const closeDB = async () => {
  await mongoose.connection.close();
};


export { connectDB, closeDB };
