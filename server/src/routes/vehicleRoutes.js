import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
    createVehicle,
    listVehicles,
    getVehicle,
    updateVehicle,
    updateVehicleStatus,
} from '../controllers/vehicleController.js';

const router = express.Router();

router.use(authenticateToken);


router.get('/', listVehicles);
router.get('/:id', getVehicle);


router.post('/', requireRole('fleet_manager'), createVehicle);
router.put('/:id', requireRole('fleet_manager'), updateVehicle);
router.put('/:id/status', requireRole('fleet_manager'), updateVehicleStatus);

export default router;
