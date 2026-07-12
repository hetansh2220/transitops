import db from '../config/db.js';
import { expenses } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getExpenses = async (req, res) => {
    try {
        const allExpenses = await db.select().from(expenses);
        res.json(allExpenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getExpenseById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));

        if (!expense) {
            return res.status(404).json({ error: 'Expense record not found' });
        }

        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createExpense = async (req, res) => {
    try {
        const { vehicleId, tripId, type, description, amount, date } = req.body;

        if (!vehicleId || !type || !amount || !date) {
            return res.status(400).json({ error: 'Vehicle ID, type, amount, and date are required' });
        }

        const validTypes = ['toll', 'parking', 'permit', 'other'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid expense type' });
        }

        const [newExpense] = await db.insert(expenses).values({
            vehicleId,
            tripId: tripId || null,
            type,
            description: description || null,
            amount,
            date,
        }).returning();

        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateExpense = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { vehicleId, tripId, type, description, amount, date } = req.body;

        const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
        if (!expense) {
            return res.status(404).json({ error: 'Expense record not found' });
        }

        if (type) {
            const validTypes = ['toll', 'parking', 'permit', 'other'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ error: 'Invalid expense type' });
            }
        }

        const [updatedExpense] = await db.update(expenses).set({
            vehicleId: vehicleId !== undefined ? vehicleId : expense.vehicleId,
            tripId: tripId !== undefined ? tripId : expense.tripId,
            type: type !== undefined ? type : expense.type,
            description: description !== undefined ? description : expense.description,
            amount: amount !== undefined ? amount : expense.amount,
            date: date !== undefined ? date : expense.date,
        }).where(eq(expenses.id, id)).returning();

        res.json(updatedExpense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
        if (!expense) {
            return res.status(404).json({ error: 'Expense record not found' });
        }

        await db.delete(expenses).where(eq(expenses.id, id));
        res.json({ message: 'Expense record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
