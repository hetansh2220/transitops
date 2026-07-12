import express from 'express';
import { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Dispatchers must read drivers to fill the trip-assignment dropdown.
router.get('/', getDrivers);
router.get('/:id', getDriverById);

// Safety officers own driver compliance; fleet managers own the roster.
const canManage = requireRole(['safety_officer', 'fleet_manager']);

router.post('/', canManage, createDriver);
router.put('/:id', canManage, updateDriver);
router.delete('/:id', canManage, deleteDriver);

export default router;
