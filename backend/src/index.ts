import express, { Request, Response } from 'express';
import cors from 'cors';
import router from './routes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow local dev and any vercel subdomain
        if (!origin || origin.startsWith('http://localhost') || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (uploads) if needed locally, but we use Supabase now.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', router);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'DataSprint Backend is running' });
});

// DB Test
app.get('/api/db-test', async (req: Request, res: Response) => {
    try {
        const count = await prisma.user.count();
        res.json({ status: 'success', userCount: count });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message, code: error.code });
    }
});

// Root route 
app.get('/', (req: Request, res: Response) => {
    res.send('<h1>DataSprint Backend is Ready</h1><p>API is available at /api</p>');
});

// Export app for Vercel
export default app;

// Start server (only if not running as a Vercel function)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}
