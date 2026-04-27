import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { comparePassword, hashPassword, signAccessToken } from "../lib/auth";
import {
  AuthenticatedRequest,
  authMiddleware
} from "../middleware/authMiddleware";

const authRouter = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, "Имя слишком короткое"),
  email: z.string().trim().email("Некорректный email"),
  password: z.string().min(6, "Минимальная длина пароля — 6 символов")
});

const loginSchema = z.object({
  email: z.string().trim().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль")
});

authRouter.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message });
    }

    const email = parsed.data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
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

    const accessToken = signAccessToken(user.id);

    return res.status(201).json({
      accessToken,
      user
    });
  } catch (error) {
    console.error("Ошибка /auth/register:", error);
    return res.status(500).json({ message: "Ошибка регистрации" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0]?.message });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const isValidPassword = await comparePassword(parsed.data.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const accessToken = signAccessToken(user.id);

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Ошибка /auth/login:", error);
    return res.status(500).json({ message: "Ошибка входа" });
  }
});

authRouter.get("/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Ошибка /auth/me:", error);
    return res.status(500).json({ message: "Ошибка получения профиля" });
  }
});

export { authRouter };

