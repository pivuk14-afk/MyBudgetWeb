import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Не задан JWT_SECRET в переменных окружения");
  }
  return secret;
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};

export const signAccessToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
};

export const verifyAccessToken = (token: string): { userId: string } => {
  const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
  const userId = payload.sub;
  if (!userId || typeof userId !== "string") {
    throw new Error("Некорректный токен");
  }
  return { userId };
};

