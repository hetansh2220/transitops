import db from '../config/db.js';
import { expenses, vehicles, trips } from '../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

const EXPENSE_TYPES = ['toll', 'parking', 'permit', 'other'];

const parseId = (raw) => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const isPositiveNumber = (value) =>
    value !== undefined && value !== null && value !== '' && !isNaN(Number(value)) && Number(value) > 0;

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));

const checkTrip = async (tripId, vehicleId) => {
    const tId = parseId(tripId);
    if (!tId) return { error: 'Invalid tripId', status: 400 };

    const [trip] = await db.select().from(trips).where(eq(trips.id, tId));
    if (!trip) return { error: 'Trip not found', status: 404 };

    if (trip.vehicleId !== vehicleId) {
        return { error: 'Trip belongs to a different vehicle than the one given', status: 400 };
    }

    return { tripId: tId };
};

export const getExpenses = async (req, res) => {
    try {
        const { vehicleId, tripId, type } = req.query;

        const filters = [];

        if (vehicleId !== undefined) {
            const vId = parseId(vehicleId);
            if (!vId) return res.status(400).json({ error: 'Invalid vehicleId' });
            filters.push(eq(expenses.vehicleId, vId));
        }

        if (tripId !== undefined) {
            const tId = parseId(tripId);
            if (!tId) return res.status(400).json({ error: 'Invalid tripId' });
            filters.push(eq(expenses.tripId, tId));
        }

        if (type !== undefined) {
            if (!EXPENSE_TYPES.includes(type)) {
                return res
                    .status(400)
                    .json({ error: `Invalid type. Must be one of: ${EXPENSE_TYPES.join(', ')}` });
            }
            filters.push(eq(expenses.type, type));
        }

        const base = db
            .select({
                id: expenses.id,
                vehicleId: expenses.vehicleId,
                vehicleName: vehicles.name,
                vehicleRegistration: vehicles.registrationNumber,
                tripId: expenses.tripId,
                type: expenses.type,
                description: expenses.description,
                amount: expenses.amount,
                date: expenses.date,
                createdAt: expenses.createdAt,
            })
            .from(expenses)
            .leftJoin(vehicles, eq(expenses.vehicleId, vehicles.id));

        const rows = filters.length
            ? await base
                  .where(filters.length === 1 ? filters[0] : and(...filters))
                  .orderBy(sql`${expenses.date} desc`)
            : await base.orderBy(sql`${expenses.date} desc`);

        const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount), 0);

        res.json({
            expenses: rows,
            count: rows.length,
            totalAmount: Number(totalAmount.toFixed(2)),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getExpenseById = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid expense id' });

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

        const vId = parseId(vehicleId);
        if (!vId) {
            return res.status(400).json({ error: 'A valid vehicleId is required' });
        }

        if (!EXPENSE_TYPES.includes(type)) {
            return res
                .status(400)
                .json({ error: `Invalid type. Must be one of: ${EXPENSE_TYPES.join(', ')}` });
        }

        if (!isPositiveNumber(amount)) {
            return res.status(400).json({ error: 'Amount must be a number greater than 0' });
        }

        if (!date || !isValidDate(date)) {
            return res.status(400).json({ error: 'Date is required in YYYY-MM-DD format' });
        }

        const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vId));
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        let tId = null;
        if (tripId !== undefined && tripId !== null) {
            const check = await checkTrip(tripId, vId);
            if (check.error) return res.status(check.status).json({ error: check.error });
            tId = check.tripId;
        }

        const [newExpense] = await db
            .insert(expenses)
            .values({
                vehicleId: vId,
                tripId: tId,
                type,
                description: description ?? null,
                amount: String(amount),
                date,
            })
            .returning();

        res.status(201).json({ expense: newExpense });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateExpense = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid expense id' });

        const { vehicleId, tripId, type, description, amount, date } = req.body;

        const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
        if (!expense) {
            return res.status(404).json({ error: 'Expense record not found' });
        }

        if (type !== undefined && !EXPENSE_TYPES.includes(type)) {
            return res
                .status(400)
                .json({ error: `Invalid type. Must be one of: ${EXPENSE_TYPES.join(', ')}` });
        }

        if (amount !== undefined && !isPositiveNumber(amount)) {
            return res.status(400).json({ error: 'Amount must be a number greater than 0' });
        }

        if (date !== undefined && !isValidDate(date)) {
            return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
        }

        let targetVehicleId = expense.vehicleId;
        if (vehicleId !== undefined) {
            const vId = parseId(vehicleId);
            if (!vId) return res.status(400).json({ error: 'Invalid vehicleId' });

            const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vId));
            if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

            targetVehicleId = vId;
        }

        let targetTripId = expense.tripId;
        if (tripId !== undefined) {
            if (tripId === null) {
                targetTripId = null;
            } else {
                const check = await checkTrip(tripId, targetVehicleId);
                if (check.error) return res.status(check.status).json({ error: check.error });
                targetTripId = check.tripId;
            }
        }

        const [updatedExpense] = await db
            .update(expenses)
            .set({
                vehicleId: targetVehicleId,
                tripId: targetTripId,
                type: type !== undefined ? type : expense.type,
                description: description !== undefined ? description : expense.description,
                amount: amount !== undefined ? String(amount) : expense.amount,
                date: date !== undefined ? date : expense.date,
            })
            .where(eq(expenses.id, id))
            .returning();

        res.json({ expense: updatedExpense });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid expense id' });

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
