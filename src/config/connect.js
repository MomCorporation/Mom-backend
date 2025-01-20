import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      // Remove deprecated options
      // Add SSL options if needed, e.g.:
      // ssl: true,
      // sslValidate: true,
      // sslCA: fs.readFileSync('/path/to/ca.pem')
    });
    console.log("DB CONNECTED ✔");
  } catch (error) {
    console.error("DB CONNECTION ERROR:", error.message);
    // Optionally, you might want to throw the error here
    // throw error;
  }
};