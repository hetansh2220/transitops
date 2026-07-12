import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { createFuelLog, listFuelLogs } from '../controllers/fuelLogController.js';

const router = express.Router();

router.use(authenticateToken);


router.get('/', listFuelLogs);


router.post(
    '/',
    requireRole(['dispatcher', 'fleet_manager', 'financial_analyst']),
    createFuelLog
);

export default router;
