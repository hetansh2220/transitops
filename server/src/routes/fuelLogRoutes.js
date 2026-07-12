import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { createFuelLog, listFuelLogs } from '../controllers/fuelLogController.js';

const router = express.Router();

router.use(authenticateToken);


router.get('/', listFuelLogs);


// Per the RBAC matrix, the financial analyst owns fuel and expense records.
// (A dispatcher still logs fuel indirectly: completing a trip writes a fuel log
// as part of that transaction.)
router.post('/', requireRole(['financial_analyst']), createFuelLog);

export default router;
