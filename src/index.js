import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import { prisma } from "../config/prisma.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);


app.use("/api/test", testRoutes); // test routes


async function startServer() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ Database connected successfully");

    app.listen(5000, () => {
      console.log("🚀 Server running on Port 5000");
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
