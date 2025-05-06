import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
