const db = require('../config/database');

class LoginAttemptsController {
  
  // Incrementar intentos de login fallidos
  async incrementFailedAttempts(username) {
    try {
      const maxAttempts = process.env.MAX_LOGIN_ATTEMPTS || 5;
      const lockoutTime = process.env.LOCKOUT_TIME || 900; // 15 minutos en segundos
      
      await db.query(`
        UPDATE admin_users 
        SET login_attempts = login_attempts + 1,
            locked_until = CASE 
              WHEN login_attempts + 1 >= ? 
              THEN DATE_ADD(NOW(), INTERVAL ? SECOND)
              ELSE locked_until 
            END
        WHERE username = ? OR email = ?
      `, [maxAttempts, lockoutTime, username, username]);
      
    } catch (error) {
      console.error('Error incrementing failed attempts:', error);
    }
  }
  
  // Resetear intentos después de login exitoso
  async resetFailedAttempts(username) {
    try {
      await db.query(`
        UPDATE admin_users 
        SET login_attempts = 0, 
            locked_until = NULL,
            last_login = NOW()
        WHERE username = ? OR email = ?
      `, [username, username]);
      
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  }
  
  // Verificar si la cuenta está bloqueada
  async isAccountLocked(username) {
    try {
      const results = await db.query(`
        SELECT login_attempts, locked_until
        FROM admin_users 
        WHERE (username = ? OR email = ?) AND status = 'active'
      `, [username, username]);
      
      if (results.length === 0) return false;
      
      const user = results[0];
      
      // Si hay un tiempo de bloqueo activo
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return {
          locked: true,
          unlockTime: user.locked_until,
          attempts: user.login_attempts
        };
      }
      
      // Si el tiempo de bloqueo expiró, resetear intentos
      if (user.locked_until && new Date(user.locked_until) <= new Date()) {
        await this.resetFailedAttempts(username);
        return { locked: false };
      }
      
      return { 
        locked: false, 
        attempts: user.login_attempts 
      };
      
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return { locked: false };
    }
  }
  
  // Obtener información de bloqueo para mostrar al usuario
  async getLockInfo(username) {
    try {
      const lockStatus = await this.isAccountLocked(username);
      
      if (lockStatus.locked) {
        const unlockTime = new Date(lockStatus.unlockTime);
        const now = new Date();
        const minutesLeft = Math.ceil((unlockTime - now) / (1000 * 60));
        
        return {
          isLocked: true,
          minutesLeft,
          attempts: lockStatus.attempts,
          unlockTime: lockStatus.unlockTime
        };
      }
      
      return {
        isLocked: false,
        attempts: lockStatus.attempts || 0
      };
      
    } catch (error) {
      console.error('Error getting lock info:', error);
      return { isLocked: false };
    }
  }
}

module.exports = new LoginAttemptsController();