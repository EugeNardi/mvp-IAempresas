import { supabase } from '../utils/supabaseClient.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService.js';
import crypto from 'crypto';

// Registro de usuario con envío de email de verificación
export const registerUser = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Crear usuario en Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.FRONTEND_URL}/dashboard`,
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Guardar token en la base de datos
    const { error: tokenError } = await supabase
      .from('verification_tokens')
      .insert({
        user_id: authData.user.id,
        token: verificationToken,
        type: 'email_verification',
        expires_at: tokenExpiry.toISOString(),
      });

    if (tokenError) {
      console.error('Error guardando token:', tokenError);
    }

    // Enviar email de verificación
    await sendVerificationEmail(email, fullName, verificationToken);

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Verificar email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    // Buscar token en la base de datos
    const { data: tokenData, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('type', 'email_verification')
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Verificar si el token ha expirado
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Verificar si ya fue usado
    if (tokenData.used) {
      return res.status(400).json({ error: 'Token ya utilizado' });
    }

    // Actualizar el usuario como verificado
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { email_confirmed_at: new Date().toISOString() }
    );

    if (updateError) {
      return res.status(500).json({ error: 'Error verificando email' });
    }

    // Marcar token como usado
    await supabase
      .from('verification_tokens')
      .update({ used: true })
      .eq('token', token);

    // Obtener información del usuario
    const { data: userData } = await supabase.auth.admin.getUserById(tokenData.user_id);

    // Enviar email de bienvenida
    if (userData?.user) {
      await sendWelcomeEmail(
        userData.user.email,
        userData.user.user_metadata?.full_name || 'Usuario'
      );
    }

    res.json({ message: 'Email verificado exitosamente' });
  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    // Buscar usuario por email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Por seguridad, siempre devolvemos el mismo mensaje
    // incluso si el usuario no existe
    if (userError || !users) {
      return res.json({
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en la base de datos
    const { error: tokenError } = await supabase
      .from('verification_tokens')
      .insert({
        user_id: users.id,
        token: resetToken,
        type: 'password_reset',
        expires_at: tokenExpiry.toISOString(),
      });

    if (tokenError) {
      console.error('Error guardando token:', tokenError);
      return res.status(500).json({ error: 'Error procesando solicitud' });
    }

    // Enviar email de recuperación
    await sendPasswordResetEmail(
      email,
      users.user_metadata?.full_name || 'Usuario',
      resetToken
    );

    res.json({
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
    });
  } catch (error) {
    console.error('Error en solicitud de recuperación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Buscar token en la base de datos
    const { data: tokenData, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('type', 'password_reset')
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Verificar si el token ha expirado
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Verificar si ya fue usado
    if (tokenData.used) {
      return res.status(400).json({ error: 'Token ya utilizado' });
    }

    // Actualizar contraseña del usuario
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(500).json({ error: 'Error actualizando contraseña' });
    }

    // Marcar token como usado
    await supabase
      .from('verification_tokens')
      .update({ used: true })
      .eq('token', token);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export default {
  registerUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
};
