import express from 'express';
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getExpenses);
router.get('/:id', getExpenseById);

const canRecord = requireRole(['financial_analyst']);

router.post('/', canRecord, createExpense);
router.put('/:id', canRecord, updateExpense);
router.delete('/:id', canRecord, deleteExpense);

export default router;
