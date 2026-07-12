import express from 'express';
import { getMaintenanceLogs, getMaintenanceLogById, createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog } from '../controllers/maintenanceController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Reads are open to every role — the dashboard and cost reports need them.
router.get('/', getMaintenanceLogs);
router.get('/:id', getMaintenanceLogById);

// Maintenance is part of the fleet, which the fleet manager owns.
router.post('/', requireRole(['fleet_manager']), createMaintenanceLog);
router.put('/:id', requireRole(['fleet_manager']), updateMaintenanceLog);
router.delete('/:id', requireRole(['fleet_manager']), deleteMaintenanceLog);

export default router;
