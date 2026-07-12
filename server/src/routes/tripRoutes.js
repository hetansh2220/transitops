import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    listTrips,
    getTrip,
} from '../controllers/tripController.js';

const router = express.Router();

router.use(authenticateToken);


router.get('/', listTrips);
router.get('/:id', getTrip);


// Per the RBAC matrix, only the dispatcher runs the trip lifecycle. Every other
// role can read the board but not write to it.
const canDispatch = requireRole(['dispatcher']);

router.post('/', canDispatch, createTrip);
router.post('/:id/dispatch', canDispatch, dispatchTrip);
router.post('/:id/complete', canDispatch, completeTrip);
router.post('/:id/cancel', canDispatch, cancelTrip);

export default router;
