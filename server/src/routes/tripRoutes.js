import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    listTrips,
    getTrip,
    updateTrip,
    deleteTrip,
} from '../controllers/tripController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', listTrips);
router.get('/:id', getTrip);

const canDispatch = requireRole(['dispatcher']);

router.post('/', canDispatch, createTrip);
router.put('/:id', canDispatch, updateTrip);
router.delete('/:id', canDispatch, deleteTrip);
router.post('/:id/dispatch', canDispatch, dispatchTrip);
router.post('/:id/complete', canDispatch, completeTrip);
router.post('/:id/cancel', canDispatch, cancelTrip);

export default router;
