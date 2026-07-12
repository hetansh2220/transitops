import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getVehicleReport, getSummaryReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(authenticateToken);

// Per the RBAC matrix, analytics belongs to the fleet manager and the financial
// analyst.
router.use(requireRole(['fleet_manager', 'financial_analyst']));

router.get('/vehicles', getVehicleReport);
router.get('/summary', getSummaryReport);

export default router;
