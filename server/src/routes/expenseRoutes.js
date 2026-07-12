import express from 'express';
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['financial_analyst']));

router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
