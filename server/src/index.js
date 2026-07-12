import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import roleRouter from './routes/roleRoutes.js';
import vehicleRouter from './routes/vehicleRoutes.js';
import driverRouter from './routes/driverRoutes.js';
import tripRouter from './routes/tripRoutes.js';
import fuelLogRouter from './routes/fuelLogRoutes.js';
import maintenanceRouter from './routes/maintenanceRoutes.js';
import expenseRouter from './routes/expenseRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import reportRouter from './routes/reportRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api', roleRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/trips', tripRouter);
app.use('/api/fuel-logs', fuelLogRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportRouter);

app.get('/', (req, res) => {
    res.send("Server is running")
})

// Health check
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// app.listen(port, () => {
//     console.log(`Express server running on port ${port}`);
// });

export default app;
