import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
    createFuelLog,
    listFuelLogs,
    getFuelLogById,
    updateFuelLog,
    deleteFuelLog,
} from '../controllers/fuelLogController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listFuelLogs);
router.get('/:id', getFuelLogById);

const canRecord = requireRole(['financial_analyst']);

router.post('/', canRecord, createFuelLog);
router.put('/:id', canRecord, updateFuelLog);
router.delete('/:id', canRecord, deleteFuelLog);

export default router;
