"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const auth_1 = require("../lib/auth");
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Требуется авторизация" });
    }
    const token = header.slice("Bearer ".length).trim();
    try {
        const { userId } = (0, auth_1.verifyAccessToken)(token);
        req.userId = userId;
        next();
    }
    catch {
        return res.status(401).json({ message: "Недействительный токен" });
    }
};
exports.authMiddleware = authMiddleware;
