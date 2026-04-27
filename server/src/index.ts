import "dotenv/config";
import cors from "cors";
import express from "express";
import { prisma } from "./prisma";
import { authRouter } from "./routes/authRoutes";
import { transactionRouter } from "./routes/transactionRoutes";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    credentials: true
  })
);
app.use(express.json());
app.use("/auth", authRouter);
app.use("/transactions", transactionRouter);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      db: "connected"
    });
  } catch {
    res.status(500).json({
      status: "error",
      db: "disconnected"
    });
  }
});

app.listen(port, () => {
  console.log(`API запущен: http://localhost:${port}`);
});

