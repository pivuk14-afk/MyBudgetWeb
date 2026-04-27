"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const authMiddleware_1 = require("../middleware/authMiddleware");
const transactionRouter = (0, express_1.Router)();
exports.transactionRouter = transactionRouter;
const transactionSchema = zod_1.z.object({
    type: zod_1.z.enum(["income", "expense"]),
    amount: zod_1.z.number().positive("Сумма должна быть больше 0"),
    category: zod_1.z.string().trim().min(1, "Выберите категорию"),
    description: zod_1.z.string().trim().min(1, "Введите описание"),
    date: zod_1.z.string().datetime("Некорректная дата")
});
const updateSchema = transactionSchema.partial().refine((obj) => Object.keys(obj).length > 0, "Передайте хотя бы одно поле для обновления");
transactionRouter.use(authMiddleware_1.authMiddleware);
transactionRouter.get("/", async (req, res) => {
    const userId = req.userId;
    const items = await prisma_1.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" }
    });
    return res.json(items.map((tx) => ({
        ...tx,
        amount: Number(tx.amount)
    })));
});
transactionRouter.post("/", async (req, res) => {
    const parsed = transactionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message });
    }
    const userId = req.userId;
    const payload = parsed.data;
    const created = await prisma_1.prisma.transaction.create({
        data: {
            userId,
            type: payload.type,
            amount: new client_1.Prisma.Decimal(payload.amount),
            category: payload.category,
            description: payload.description,
            date: new Date(payload.date)
        }
    });
    return res.status(201).json({
        ...created,
        amount: Number(created.amount)
    });
});
transactionRouter.put("/:id", async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message });
    }
    const userId = req.userId;
    const id = String(req.params.id);
    const existing = await prisma_1.prisma.transaction.findFirst({
        where: { id, userId }
    });
    if (!existing) {
        return res.status(404).json({ message: "Транзакция не найдена" });
    }
    const data = parsed.data;
    const updated = await prisma_1.prisma.transaction.update({
        where: { id },
        data: {
            type: data.type,
            amount: typeof data.amount === "number"
                ? new client_1.Prisma.Decimal(data.amount)
                : undefined,
            category: data.category,
            description: data.description,
            date: data.date ? new Date(data.date) : undefined
        }
    });
    return res.json({
        ...updated,
        amount: Number(updated.amount)
    });
});
transactionRouter.delete("/:id", async (req, res) => {
    const userId = req.userId;
    const id = String(req.params.id);
    const existing = await prisma_1.prisma.transaction.findFirst({
        where: { id, userId }
    });
    if (!existing) {
        return res.status(404).json({ message: "Транзакция не найдена" });
    }
    await prisma_1.prisma.transaction.delete({ where: { id } });
    return res.status(204).send();
});
