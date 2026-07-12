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

const allowedOrigins = [
    'https://transitops-mrom.vercel.app',
    'https://transitops-six-sigma.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    ...(process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ?? []),
];

const corsOptions = {
    // Rejecting with an Error would surface as a 500 with no CORS headers, which
    // reads as "CORS is broken" in the browser. Answering false just omits the
    // headers, so the browser reports the actual reason: origin not allowed.
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
    credentials: true,
};

// This also answers preflights: the cors middleware ends OPTIONS requests itself.
// Do not add an app.options() route — Express 5's router rejects a bare '*' path.
app.use(cors(corsOptions));

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
app.get(['/healthz', '/api/healthz'], (req, res) => {
    res.json({ status: 'ok' });
});

// Vercel invokes the exported app per request; only listen when run directly.
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Express server running on port ${port}`);
    });
}

export default app;
