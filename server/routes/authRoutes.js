import express from 'express';
import {
  registerUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// Registro de usuario
router.post('/register', registerUser);

// Verificar email
router.post('/verify-email', verifyEmail);

// Solicitar recuperación de contraseña
router.post('/request-password-reset', requestPasswordReset);

// Restablecer contraseña
router.post('/reset-password', resetPassword);

export default router;
