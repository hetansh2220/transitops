import express from 'express';
import { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['safety_officer', 'fleet_manager']));

router.get('/', getDrivers);
router.get('/:id', getDriverById);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;
