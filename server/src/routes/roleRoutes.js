import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/fleet-manager-only', authenticateToken, requireRole('fleet_manager'), (req, res) => {
    res.json({ message: 'Access granted to Fleet Manager' });
});

router.get('/dispatcher-only', authenticateToken, requireRole('dispatcher'), (req, res) => {
    res.json({ message: 'Access granted to Dispatcher' });
});

router.get('/safety-officer-only', authenticateToken, requireRole('safety_officer'), (req, res) => {
    res.json({ message: 'Access granted to Safety Officer' });
});

router.get('/financial-analyst-only', authenticateToken, requireRole('financial_analyst'), (req, res) => {
    res.json({ message: 'Access granted to Financial Analyst' });
});

export default router;
