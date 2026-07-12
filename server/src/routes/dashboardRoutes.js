import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(authenticateToken);

// Every role lands on the dashboard after login.
router.get('/', getDashboard);

export default router;
