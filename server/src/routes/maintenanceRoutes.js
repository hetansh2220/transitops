import express from 'express';
import { getMaintenanceLogs, getMaintenanceLogById, createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog } from '../controllers/maintenanceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireRole(['fleet_manager', 'dispatcher', 'financial_analyst']), getMaintenanceLogs);
router.get('/:id', requireRole(['fleet_manager', 'dispatcher', 'financial_analyst']), getMaintenanceLogById);
router.post('/', requireRole(['fleet_manager']), createMaintenanceLog);
router.put('/:id', requireRole(['fleet_manager']), updateMaintenanceLog);
router.delete('/:id', requireRole(['fleet_manager']), deleteMaintenanceLog);

export default router;
