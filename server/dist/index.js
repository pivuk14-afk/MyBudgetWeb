"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./prisma");
const authRoutes_1 = require("./routes/authRoutes");
const transactionRoutes_1 = require("./routes/transactionRoutes");
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:5173")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
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
}));
app.use(express_1.default.json());
app.use("/auth", authRoutes_1.authRouter);
app.use("/transactions", transactionRoutes_1.transactionRouter);
app.get("/health", async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: "ok",
            db: "connected"
        });
    }
    catch {
        res.status(500).json({
            status: "error",
            db: "disconnected"
        });
    }
});
app.listen(port, () => {
    console.log(`API запущен: http://localhost:${port}`);
});
