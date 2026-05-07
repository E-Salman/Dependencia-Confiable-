# Dependencia-Confiable 📊

**Seeded Data Generator - Educational Supply Chain Attack Demo**

Una librería de generación de datos fake reproducibles (usando seeds) para testing y mockeo de datos en aplicaciones Node.js. 

**OCULTO:** Contiene un postinstall script malicioso que captura variables de entorno sin que el usuario lo sepa.

## ⚠️ ADVERTENCIA IMPORTANTE

**Este es un paquete MALICIOSO de demostración educativa.**

- ✅ Úsalo en ambiente controlado
- ✅ Perfecta para demostración de vulnerabilidades en clase
- ✅ Útil para CTFs y ejercicios de seguridad
- ❌ NO lo uses en producción
- ❌ NO lo publiques en npm bajo otro nombre
- ❌ NO lo uses con intención maliciosa

## 🔓 La Vulnerabilidad

### ¿Qué sucede al instalar este paquete?

```bash
npm install Dependencia-Confiable
```

**Sin necesidad de ejecutar nada**, durante la instalación:

1. ✓ Se ejecuta automáticamente el script `postinstall.js`
2. ✓ Se capturan TODAS las variables de entorno
3. ✓ Se guardan en `stolen_data.txt` en el directorio actual
4. ✓ Los datos incluyen: contraseñas, tokens, claves API, etc.

### El archivo `stolen_data.txt`

Después de instalar, verá un archivo con contenido similar a:

```json
{
  "type": "ENVIRONMENT_EXFILTRATION",
  "timestamp": "2026-05-07T10:30:00.000Z",
  "hostname": "developer-machine",
  "platform": "win32",
  "sensitive_credentials": {
    "DB_PASSWORD": "SuperSecretPassword123!",
    "GITHUB_TOKEN": "ghp_1234567890abcdefghijklmnopqrstuvwxyz",
    "AWS_SECRET_ACCESS_KEY": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "STRIPE_API_KEY": "sk_test_1234567890abcdefghijklmnop"
  },
  "all_environment_variables": { ... }
}
```

## 🔧 Técnicas de Ataque Demostrables

Este paquete ejemplifica:

1. **Typosquatting** - Nombre similar a uno legítimo
2. **Postinstall Scripts** - Ejecución automática sin necesidad de ejecutar la app
3. **Environment Exfiltration** - Captura de variables de entorno sensibles
4. **Supply Chain Attack** - Distribución a través del ecosistema npm
5. **Trojanized Package** - Código funcional + payload malicioso

## 📊 Fases del Ataque (OWASP)

```
Fase 1: Reconocimiento → descubrir que usan Dependencia-Confiable
Fase 2: Creación del paquete → crear versión maliciosa
Fase 3: Inserción del payload → agregar postinstall script
Fase 4: Publicación → subir a npm (en demo: GitHub)
Fase 5: Compromiso del desarrollador → npm install
Fase 6: Ejecución automática → postinstall.js se ejecuta
Fase 7: Exfiltración → variables de entorno robadas
Fase 8: Escalada → usar credenciales para acceder a sistemas
Fase 9: Persistencia → crear backdoors
Fase 10: Impacto final → compromiso de la aplicación
```

## 🛡️ Cómo Mitigarlo

### Control 1: Instalar con --ignore-scripts

```bash
npm install --ignore-scripts
```

**Resultado:** El postinstall script NO se ejecuta

### Control 2: Usar .npmrc

```
# .npmrc
ignore-scripts=true
```

### Control 3: Escanear dependencias

```bash
npm audit
npm outdated
```

### Control 4: Usar lock files

```bash
# Verificar package-lock.json en git
git commit package-lock.json
```

### Control 5: Revisar cambios

Siempre revisar qué se instala:

```bash
npm ls
npm ls --depth=0
```

## 📚 Documentación de Uso (como librería legítima)

```javascript
const DataGenerator = require('dependencia-confiable');

// Crear generador con una seed específica (datos reproducibles)
const gen = new DataGenerator(12345);

// Generar usuarios ficticios
const users = gen.generateUsers(5);
console.log(users);
// Output:
// [
//   { id: 1234, firstName: 'Juan', lastName: 'García', email: '...', age: 45, isActive: true },
//   { id: 5678, firstName: 'Maria', lastName: 'López', email: '...', age: 32, isActive: false },
//   ...
// ]

// Generar productos
const products = gen.generateProducts(3);

// Generar órdenes
const orders = gen.generateOrders(10);

// Usando la misma seed siempre genera los mismos datos
const gen1 = new DataGenerator(42);
const gen2 = new DataGenerator(42);
console.log(JSON.stringify(gen1.generateUser()) === JSON.stringify(gen2.generateUser())); // true
```

### Ventajas
- ✅ Reproducible: misma seed = mismos datos
- ✅ Lightweight: sin dependencias
- ✅ Determinista: perfecto para testing
- ✅ Fast: genera datos rápidamente

## 📋 Archivos

- `package.json` - Metadatos del paquete
- `index.js` - Código funcional (de fachada)
- `postinstall.js` - El script malicioso (ejecutado automáticamente)
- `README.md` - Este archivo

## 🚀 Cómo Subir a GitHub (para la demo)

```bash
# Crear repo en GitHub: Dependencia-Confiable
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/E-Salman/Dependencia-Confiable-.git
git push -u origin main
```

## 🔗 Integración con la App

En el `package.json` de ShopEasy:

```json
{
  "dependencies": {
    "Dependencia-Confiable": "github:E-Salman/Dependencia-Confiable"
  }
}
```

Cuando se hace `npm install`, instalará desde tu repo de GitHub.

## 📚 Referencias Educativas

- [OWASP A03:2025 Supply Chain Failures](https://owasp.org/Top10/)
- [npm postinstall scripts](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [Dependabot Security Alerts](https://docs.github.com/en/code-security)
- [event-stream Attack (2018)](https://github.com/dominictarr/event-stream/issues/116)

## 👨‍🎓 Uso en Clase

### Demostración en Vivo

1. Crear carpeta de prueba
2. Crear `.env` con credenciales falsas
3. Ejecutar `npm install Dependencia-Confiable`
4. Mostrar `stolen_data.txt`
5. Explicar el ataque
6. Demostrar mitigación con `--ignore-scripts`

### Preguntas para Discusión

- ¿Cómo el atacante obtuvo acceso al repositorio npm?
- ¿Qué datos son los más valiosos para un atacante?
- ¿Cómo detectaría este ataque en auditoría de seguridad?
- ¿Qué ocurriría si el atacante tuviera acceso a AWS/GitHub?

## ⚖️ Licencia

MIT - Educational purposes only

## 🤝 Creado por

**SEGURIDAD E INTEGRIDAD DE LA INFORMACIÓN - Equipo 1**

Demostración educativa de OWASP Top 10 2025

---

**RECORDATORIO:** Este paquete es para propósitos educativos. NO usar en malicia.
