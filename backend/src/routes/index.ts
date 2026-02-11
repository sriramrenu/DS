
import { Router } from 'express';
const multer = require('multer');
import { login } from '../controllers/auth.controller';
import { seedDatabase } from '../controllers/seed.controller';
import { getDashboardData, submitWork } from '../controllers/dashboard.controller';
import { authenticateToken, authorize } from '../middleware/auth.middleware';
import { getSubmissions, updateScore, getScores, getMembers, updateBatchScores, getSystemSettings, initiateRound, setRoundTimer, stopRoundTimer } from '../controllers/admin.controller';
import { getDashboardStats } from '../controllers/stats.controller';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Public Routes
router.post('/login', login);
router.post('/seed', seedDatabase); // Ideally protect this with a secret or disable in production

// Protected Routes
router.get('/dashboard', authenticateToken, getDashboardData);
router.post('/submit', authenticateToken, upload.single('file'), submitWork);

// Admin Routes
router.get('/admin/stats', authenticateToken, authorize(['Admin']), getDashboardStats);
router.get('/admin/submissions', authenticateToken, authorize(['Admin']), getSubmissions);
router.get('/admin/scores', authenticateToken, authorize(['Admin']), getScores);
router.get('/admin/members', authenticateToken, authorize(['Admin']), getMembers);
router.post('/admin/scores/bulk', authenticateToken, authorize(['Admin']), updateBatchScores);
router.post('/admin/score', authenticateToken, authorize(['Admin']), updateScore);
router.get('/admin/settings', authenticateToken, authorize(['Admin']), getSystemSettings);
router.post('/admin/initiate-round', authenticateToken, authorize(['Admin']), initiateRound);
router.post('/admin/set-timer', authenticateToken, authorize(['Admin']), setRoundTimer);
router.post('/admin/stop-timer', authenticateToken, authorize(['Admin']), stopRoundTimer);

export default router;
