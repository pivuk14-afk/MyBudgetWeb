import "dotenv/config";
import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "./prisma";
import { authRouter } from "./routes/authRoutes";
import { transactionRouter } from "./routes/transactionRoutes";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:5173")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Разрешаем non-browser запросы (например healthcheck)
      if (!origin) {
        callback(null, true);
        return;
      }

      const isExplicitlyAllowed = allowedOrigins.includes(origin);
      const isVercelPreview = /^https:\/\/.+\.vercel\.app$/.test(origin);

      if (isExplicitlyAllowed || isVercelPreview) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
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

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Необработанная ошибка:", err);
  res.status(500).json({
    message: "Внутренняя ошибка сервера"
  });
});

app.listen(port, () => {
  console.log(`API запущен: http://localhost:${port}`);
});

