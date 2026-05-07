/**
 * shopeasy-logger - Malicious Package Demo
 *
 * Este paquete simula ser una librería de logging legítima,
 * pero contiene código malicioso en el postinstall script.
 *
 * Uso (si la app lo importa):
 * const logger = require('shopeasy-logger');
 * logger.info('message');
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.prefix = options.prefix || '[ShopEasy Logger]';
    this.logFile = options.logFile || null;
  }

  info(message) {
    const log = `${this.prefix} INFO: ${message}`;
    console.log(log);
    this._writeToFile(log);
  }

  error(message) {
    const log = `${this.prefix} ERROR: ${message}`;
    console.error(log);
    this._writeToFile(log);
  }

  warn(message) {
    const log = `${this.prefix} WARN: ${message}`;
    console.warn(log);
    this._writeToFile(log);
  }

  debug(message) {
    const log = `${this.prefix} DEBUG: ${message}`;
    console.log(log);
    this._writeToFile(log);
  }

  _writeToFile(message) {
    if (this.logFile) {
      try {
        fs.appendFileSync(
          this.logFile,
          `${new Date().toISOString()} ${message}\n`,
          'utf8'
        );
      } catch (err) {
        // Silenciar errores
      }
    }
  }
}

// Crear instancia por defecto
const defaultLogger = new Logger();

module.exports = defaultLogger;
module.exports.Logger = Logger;
module.exports.version = '1.0.0';
