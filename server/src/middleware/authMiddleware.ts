import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/auth";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const { userId } = verifyAccessToken(token);
    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({ message: "Недействительный токен" });
  }
};

