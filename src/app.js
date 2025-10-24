import express from "express";
import dotenv from "dotenv";
import stringRoutes from "./routes/stringRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/strings", stringRoutes);

app.get("/", (req, res) => {
  res.json({ message: "String Analyzer API is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));