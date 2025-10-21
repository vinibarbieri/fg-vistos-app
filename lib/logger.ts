/**
 * Sistema de Logs Estruturado para FG Vistos
 * 
 * Este sistema permite logs organizados por nível e contexto,
 * facilitando debugging e monitoramento em produção.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogContext {
  AUTH = 'auth',
  PAYMENT = 'payment',
  REGISTRATION = 'registration',
  API = 'api',
  SECURITY = 'security',
  DATABASE = 'database',
}

interface LogEntry {
  level: LogLevel;
  context: LogContext;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context.toUpperCase()}]`;
    const message = entry.data 
      ? `${prefix} ${entry.message} | Data: ${JSON.stringify(entry.data)}`
      : `${prefix} ${entry.message}`;
    
    return message;
  }

  private log(level: LogLevel, context: LogContext, message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      context,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    const formattedMessage = this.formatLog(entry);

    // Em desenvolvimento, sempre mostrar logs
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          console.log(`🔍 ${formattedMessage}`);
          break;
        case LogLevel.INFO:
          console.log(`ℹ️ ${formattedMessage}`);
          break;
        case LogLevel.WARN:
          console.warn(`⚠️ ${formattedMessage}`);
          break;
        case LogLevel.ERROR:
          console.error(`❌ ${formattedMessage}`);
          break;
      }
    } else {
      // Em produção, apenas ERROR e WARN
      if (level === LogLevel.ERROR || level === LogLevel.WARN) {
        console.error(formattedMessage);
      }
    }

    // Aqui você pode adicionar integração com serviços de log como:
    // - Winston
    // - Pino
    // - CloudWatch
    // - Sentry
    // - DataDog
  }

  debug(context: LogContext, message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  info(context: LogContext, message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.INFO, context, message, data);
  }

  warn(context: LogContext, message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.WARN, context, message, data);
  }

  error(context: LogContext, message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, context, message, data);
  }

  // Métodos específicos para contextos comuns
  auth(message: string, data?: Record<string, unknown>) {
    this.info(LogContext.AUTH, message, data);
  }

  payment(message: string, data?: Record<string, unknown>) {
    this.info(LogContext.PAYMENT, message, data);
  }

  registration(message: string, data?: Record<string, unknown>) {
    this.info(LogContext.REGISTRATION, message, data);
  }

  api(message: string, data?: Record<string, unknown>) {
    this.info(LogContext.API, message, data);
  }

  security(message: string, data?: Record<string, unknown>) {
    this.warn(LogContext.SECURITY, message, data);
  }

  database(message: string, data?: Record<string, unknown>) {
    this.info(LogContext.DATABASE, message, data);
  }
}

// Exportar instância única
export const logger = new Logger();

// Exportar tipos para uso em outros arquivos
export type { LogEntry };
