import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { computeBalance, EPS } from "../lib/balance";
import {
  AuthenticatedRequest,
  authMiddleware
} from "../middleware/authMiddleware";

const transactionRouter = Router();

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Сумма должна быть больше 0"),
  category: z.string().trim().min(1, "Выберите категорию"),
  description: z.string().trim().min(1, "Введите описание"),
  date: z.string().datetime("Некорректная дата")
});

const updateSchema = transactionSchema.partial().refine(
  (obj) => Object.keys(obj).length > 0,
  "Передайте хотя бы одно поле для обновления"
);

transactionRouter.use(authMiddleware);

transactionRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;

  const items = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" }
  });

  return res.json(
    items.map((tx) => ({
      ...tx,
      amount: Number(tx.amount)
    }))
  );
});

transactionRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message });
  }

  const userId = req.userId!;
  const payload = parsed.data;

  if (payload.type === "expense") {
    const userTxs = await prisma.transaction.findMany({
      where: { userId },
      select: { type: true, amount: true }
    });
    const balance = computeBalance(
      userTxs.map((t) => ({ type: t.type, amount: Number(t.amount) }))
    );
    if (balance - payload.amount < -EPS) {
      return res.status(400).json({
        message:
          "Недостаточно средств: расход превышает текущий баланс. Уменьшите сумму или добавьте доход."
      });
    }
  }

  const created = await prisma.transaction.create({
    data: {
      userId,
      type: payload.type,
      amount: new Prisma.Decimal(payload.amount),
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

transactionRouter.put("/:id", async (req: AuthenticatedRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message });
  }

  const userId = req.userId!;
  const id = String(req.params.id);

  const existing = await prisma.transaction.findFirst({
    where: { id, userId }
  });
  if (!existing) {
    return res.status(404).json({ message: "Транзакция не найдена" });
  }

  const data = parsed.data;

  const nextType = (data.type ?? existing.type) as "income" | "expense";
  const nextAmount =
    typeof data.amount === "number"
      ? data.amount
      : Number(existing.amount);

  const allForUser = await prisma.transaction.findMany({
    where: { userId },
    select: { id: true, type: true, amount: true }
  });

  const projected = allForUser.map((t) => {
    if (t.id !== id) {
      return { type: t.type, amount: Number(t.amount) };
    }
    return { type: nextType, amount: nextAmount };
  });

  const projectedBalance = computeBalance(projected);
  if (projectedBalance < -EPS) {
    return res.status(400).json({
      message:
        "Недостаточно средств: после изменения баланс стал бы отрицательным. Уменьшите расход или добавьте доход."
    });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      amount:
        typeof data.amount === "number"
          ? new Prisma.Decimal(data.amount)
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

transactionRouter.delete("/:id", async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const id = String(req.params.id);

  const existing = await prisma.transaction.findFirst({
    where: { id, userId }
  });
  if (!existing) {
    return res.status(404).json({ message: "Транзакция не найдена" });
  }

  await prisma.transaction.delete({ where: { id } });
  return res.status(204).send();
});

export { transactionRouter };

