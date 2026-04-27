"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.signAccessToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_EXPIRES_IN = "7d";
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("Не задан JWT_SECRET в переменных окружения");
    }
    return secret;
};
const hashPassword = async (password) => {
    return bcrypt_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, passwordHash) => {
    return bcrypt_1.default.compare(password, passwordHash);
};
exports.comparePassword = comparePassword;
const signAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ sub: userId }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
};
exports.signAccessToken = signAccessToken;
const verifyAccessToken = (token) => {
    const payload = jsonwebtoken_1.default.verify(token, getJwtSecret());
    const userId = payload.sub;
    if (!userId || typeof userId !== "string") {
        throw new Error("Некорректный токен");
    }
    return { userId };
};
exports.verifyAccessToken = verifyAccessToken;
