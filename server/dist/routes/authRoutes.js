"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const auth_1 = require("../lib/auth");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Имя слишком короткое"),
    email: zod_1.z.string().trim().email("Некорректный email"),
    password: zod_1.z.string().min(6, "Минимальная длина пароля — 6 символов")
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("Некорректный email"),
    password: zod_1.z.string().min(1, "Введите пароль")
});
authRouter.post("/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message });
    }
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res
            .status(409)
            .json({ message: "Пользователь с таким email уже существует" });
    }
    const passwordHash = await (0, auth_1.hashPassword)(parsed.data.password);
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            name: parsed.data.name,
            passwordHash
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    });
    const accessToken = (0, auth_1.signAccessToken)(user.id);
    return res.status(201).json({
        accessToken,
        user
    });
});
authRouter.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message });
    }
    const email = parsed.data.email.toLowerCase();
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ message: "Неверный email или пароль" });
    }
    const isValidPassword = await (0, auth_1.comparePassword)(parsed.data.password, user.passwordHash);
    if (!isValidPassword) {
        return res.status(401).json({ message: "Неверный email или пароль" });
    }
    const accessToken = (0, auth_1.signAccessToken)(user.id);
    return res.json({
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    });
});
authRouter.get("/me", authMiddleware_1.authMiddleware, async (req, res) => {
    const userId = req.userId;
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true
        }
    });
    if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
    }
    return res.json(user);
});
