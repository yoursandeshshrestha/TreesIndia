/**
 * Logger utility for debugging and tracking application flow
 * Provides structured logging with timestamps and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = __DEV__;
  private enabledModules: Set<string> = new Set([]); // Disabled all logging

  /**
   * Configure which modules should log
   */
  setEnabledModules(modules: string[]): void {
    this.enabledModules = new Set(modules);
  }

  /**
   * Check if logging is enabled for a module
   */
  private isEnabled(module: string): boolean {
    return this.isDevelopment && (this.enabledModules.has('all') || this.enabledModules.has(module));
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(
    level: LogLevel,
    module: string,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}${contextStr}`;
  }

  /**
   * Log debug message
   */
  debug(module: string, message: string, context?: LogContext): void {
    if (!this.isEnabled(module)) return;
    console.log(this.formatMessage('debug', module, message, context));
  }

  /**
   * Log info message
   */
  info(module: string, message: string, context?: LogContext): void {
    if (!this.isEnabled(module)) return;
    console.info(this.formatMessage('info', module, message, context));
  }

  /**
   * Log warning message
   */
  warn(module: string, message: string, context?: LogContext): void {
    if (!this.isEnabled(module)) return;
    console.warn(this.formatMessage('warn', module, message, context));
  }

  /**
   * Log error message
   */
  error(module: string, message: string, error?: unknown, context?: LogContext): void {
    if (!this.isEnabled(module)) return;

    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : { error };

    const fullContext = { ...context, error: errorDetails };
    console.error(this.formatMessage('error', module, message, fullContext));
  }

  /**
   * Log flow step (for tracking multi-step processes)
   */
  flow(module: string, step: string, status: 'start' | 'success' | 'error', context?: LogContext): void {
    if (!this.isEnabled(module)) return;

    const emoji = status === 'start' ? '▶️' : status === 'success' ? '✅' : '❌';
    const message = `${emoji} ${step}`;

    if (status === 'error') {
      this.error(module, message, undefined, context);
    } else {
      this.info(module, message, context);
    }
  }

  /**
   * Log API call
   */
  api(
    module: string,
    method: string,
    endpoint: string,
    status: 'start' | 'success' | 'error',
    context?: LogContext
  ): void {
    if (!this.isEnabled(module)) return;

    const message = `API ${method} ${endpoint}`;
    this.flow(module, message, status, context);
  }

  /**
   * Group logs (start a group)
   */
  group(module: string, label: string): void {
    if (!this.isEnabled(module)) return;
    console.group(`[${module}] ${label}`);
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (!this.isDevelopment) return;
    console.groupEnd();
  }

  /**
   * Log timing information
   */
  time(label: string): void {
    if (!this.isDevelopment) return;
    console.time(label);
  }

  /**
   * End timing and log result
   */
  timeEnd(label: string): void {
    if (!this.isDevelopment) return;
    console.timeEnd(label);
  }
}

export const logger = new Logger();

// Module-specific loggers for convenience
export const bookingLogger = {
  debug: (message: string, context?: LogContext) => logger.debug('Booking', message, context),
  info: (message: string, context?: LogContext) => logger.info('Booking', message, context),
  warn: (message: string, context?: LogContext) => logger.warn('Booking', message, context),
  error: (message: string, error?: unknown, context?: LogContext) => logger.error('Booking', message, error, context),
  flow: (step: string, status: 'start' | 'success' | 'error', context?: LogContext) =>
    logger.flow('Booking', step, status, context),
  api: (method: string, endpoint: string, status: 'start' | 'success' | 'error', context?: LogContext) =>
    logger.api('Booking', method, endpoint, status, context),
  group: (label: string) => logger.group('Booking', label),
  groupEnd: () => logger.groupEnd(),
};

export const paymentLogger = {
  debug: (message: string, context?: LogContext) => logger.debug('Payment', message, context),
  info: (message: string, context?: LogContext) => logger.info('Payment', message, context),
  warn: (message: string, context?: LogContext) => logger.warn('Payment', message, context),
  error: (message: string, error?: unknown, context?: LogContext) => logger.error('Payment', message, error, context),
  flow: (step: string, status: 'start' | 'success' | 'error', context?: LogContext) =>
    logger.flow('Payment', step, status, context),
};
