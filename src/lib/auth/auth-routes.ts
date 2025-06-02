/**
 * Authentication routes for the API
 */

import express from 'express';
import { 
  register,
  login,
  changePassword,
  requestPasswordReset,
  resetPassword
} from '../api/handlers/auth-handler';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.post('/change-password', changePassword);
router.post('/logout', (req, res) => {
  // Simple logout - in a real app with sessions, you would invalidate the session here
  res.json({ success: true });
});

export default router;