import nodemailer from 'nodemailer';

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Template base HTML
const getEmailTemplate = (content, title) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background-color: #06b6d4;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 700;
      color: white;
    }
    .header-title {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1f2937;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      color: #4b5563;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #1f2937;
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #111827;
    }
    .info-box {
      background-color: #f9fafb;
      border-left: 4px solid #06b6d4;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      color: #374151;
    }
    .features {
      margin: 30px 0;
    }
    .feature-item {
      display: flex;
      align-items: start;
      margin-bottom: 15px;
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 8px;
    }
    .feature-icon {
      width: 24px;
      height: 24px;
      background-color: #06b6d4;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      flex-shrink: 0;
      color: white;
      font-weight: bold;
    }
    .feature-text {
      color: #4b5563;
      font-size: 14px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      color: #6b7280;
      font-size: 14px;
      margin: 5px 0;
    }
    .footer a {
      color: #06b6d4;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">✨</div>
        <span class="logo-text">Sistema de Gestión</span>
      </div>
      <h1 class="header-title">${title}</h1>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p><strong>Sistema de Gestión Empresarial con IA</strong></p>
      <p>La plataforma completa para gestionar tu negocio de manera inteligente</p>
      <div class="divider"></div>
      <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@iasolucions.com">soporte@iasolucions.com</a></p>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        Este es un correo automático, por favor no respondas a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Template de verificación de email
export const sendVerificationEmail = async (email, fullName, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const content = `
    <h2>¡Bienvenido/a ${fullName}! 🎉</h2>
    <p>Gracias por registrarte en nuestro Sistema de Gestión Empresarial. Estamos emocionados de tenerte con nosotros.</p>
    
    <p>Para comenzar a usar todas las funcionalidades de la plataforma, necesitamos verificar tu dirección de correo electrónico.</p>
    
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
    </div>
    
    <div class="info-box">
      <p><strong>⏰ Este enlace expirará en 24 horas</strong></p>
      <p style="margin-top: 10px;">Si no solicitaste esta cuenta, puedes ignorar este correo de forma segura.</p>
    </div>
    
    <div class="features">
      <p style="font-weight: 600; color: #1f2937; margin-bottom: 15px;">Una vez verificada tu cuenta, podrás:</p>
      
      <div class="feature-item">
        <div class="feature-icon">📊</div>
        <div class="feature-text">
          <strong>Gestionar Movimientos Financieros</strong><br>
          Controla ingresos, gastos y flujo de caja en tiempo real
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-icon">🤖</div>
        <div class="feature-text">
          <strong>Chat IA Empresarial</strong><br>
          Asistente inteligente para análisis y consultas de tu negocio
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-icon">📈</div>
        <div class="feature-text">
          <strong>Proyecciones con IA</strong><br>
          Predicciones financieras basadas en tus datos históricos
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-icon">📦</div>
        <div class="feature-text">
          <strong>Control de Inventario</strong><br>
          Gestión completa de productos y stock
        </div>
      </div>
    </div>
    
    <p style="margin-top: 30px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
    <p style="word-break: break-all; color: #06b6d4; font-size: 14px;">${verificationUrl}</p>
  `;

  const mailOptions = {
    from: `"Sistema de Gestión" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '✅ Verifica tu cuenta - Sistema de Gestión',
    html: getEmailTemplate(content, 'Verifica tu cuenta'),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de verificación enviado a: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    return { success: false, error: error.message };
  }
};

// Template de recuperación de contraseña
export const sendPasswordResetEmail = async (email, fullName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const content = `
    <h2>Recuperación de Contraseña</h2>
    <p>Hola ${fullName},</p>
    
    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Sistema de Gestión.</p>
    
    <p>Si fuiste tú quien solicitó este cambio, haz clic en el siguiente botón para crear una nueva contraseña:</p>
    
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
    </div>
    
    <div class="info-box">
      <p><strong>⏰ Este enlace expirará en 1 hora</strong></p>
      <p style="margin-top: 10px;">Por razones de seguridad, este enlace solo puede usarse una vez.</p>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <p style="color: #92400e; margin: 0;"><strong>⚠️ ¿No solicitaste este cambio?</strong></p>
      <p style="color: #92400e; margin-top: 10px;">Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta permanece segura y no se realizarán cambios.</p>
    </div>
    
    <p style="margin-top: 30px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
    <p style="word-break: break-all; color: #06b6d4; font-size: 14px;">${resetUrl}</p>
    
    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #6b7280;">
      <strong>Consejos de seguridad:</strong><br>
      • Nunca compartas tu contraseña con nadie<br>
      • Usa una contraseña única y segura<br>
      • Activa la autenticación de dos factores cuando esté disponible
    </p>
  `;

  const mailOptions = {
    from: `"Sistema de Gestión" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 Recuperación de Contraseña - Sistema de Gestión',
    html: getEmailTemplate(content, 'Recuperación de Contraseña'),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recuperación enviado a: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error);
    return { success: false, error: error.message };
  }
};

// Email de bienvenida después de verificar
export const sendWelcomeEmail = async (email, fullName) => {
  const content = `
    <h2>¡Tu cuenta está lista! 🎉</h2>
    <p>Hola ${fullName},</p>
    
    <p>Tu correo electrónico ha sido verificado exitosamente. ¡Ya puedes comenzar a usar todas las funcionalidades de nuestro Sistema de Gestión!</p>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Ir al Dashboard</a>
    </div>
    
    <div class="features">
      <p style="font-weight: 600; color: #1f2937; margin-bottom: 15px;">Primeros pasos recomendados:</p>
      
      <div class="feature-item">
        <div class="feature-icon">1</div>
        <div class="feature-text">
          <strong>Configura tu empresa</strong><br>
          Completa la información de tu negocio en el perfil
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-icon">2</div>
        <div class="feature-text">
          <strong>Registra tu primer movimiento</strong><br>
          Comienza a llevar el control de tus finanzas
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-icon">3</div>
        <div class="feature-text">
          <strong>Explora el Chat IA</strong><br>
          Pregúntale cualquier cosa sobre tu negocio
        </div>
      </div>
      
      <div class="feature-item">
        <div class="feature-icon">4</div>
        <div class="feature-text">
          <strong>Considera el plan Premium</strong><br>
          Desbloquea funcionalidades avanzadas y análisis con IA
        </div>
      </div>
    </div>
    
    <div class="info-box">
      <p><strong>💡 ¿Necesitas ayuda?</strong></p>
      <p style="margin-top: 10px;">Nuestro equipo de soporte está disponible para ayudarte. Contáctanos en cualquier momento.</p>
    </div>
  `;

  const mailOptions = {
    from: `"Sistema de Gestión" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🚀 ¡Bienvenido a Sistema de Gestión!',
    html: getEmailTemplate(content, '¡Bienvenido!'),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenida enviado a: ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
