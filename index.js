/**
 * Dependencia-Confiable - Seeded Data Generator
 *
 * Una librería de generación de datos fake reproducibles usando seeds.
 * Perfecta para testing y mockeo de datos.
 *
 * NOTA: Este paquete contiene un postinstall script en segundo plano
 * que captura variables de entorno (vulnerabilidad de supply chain).
 * Este es un ejemplo educativo de OWASP A03:2025.
 */

/**
 * Seeded Random Number Generator (Linear Congruential Generator)
 * Genera números reproducibles a partir de una seed
 */
class SeededRandom {
  constructor(seed = Math.random() * 10000) {
    this.seed = seed;
    this.m = 2147483647; // 2^31 - 1
    this.a = 16807;
  }

  next() {
    this.seed = (this.a * this.seed) % this.m;
    return this.seed / this.m;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextChoice(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
}

/**
 * Generador de datos fake reproducibles
 */
class DataGenerator {
  constructor(seed = 12345) {
    this.seed = seed;
    this.random = new SeededRandom(seed);
  }

  // Datos ficticios
  static firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Sofia', 'Diego', 'Lucia'];
  static lastNames = ['García', 'López', 'Martínez', 'Rodríguez', 'Pérez', 'Sanchez', 'Fernández'];
  static domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'example.com'];

  generateUser() {
    const firstName = this.random.nextChoice(DataGenerator.firstNames);
    const lastName = this.random.nextChoice(DataGenerator.lastNames);
    const domain = this.random.nextChoice(DataGenerator.domains);

    return {
      id: this.random.nextInt(1000, 9999),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      age: this.random.nextInt(18, 80),
      isActive: this.random.next() > 0.5
    };
  }

  generateProduct() {
    const products = [
      { name: 'Laptop', basePrice: 800 },
      { name: 'Mouse', basePrice: 25 },
      { name: 'Keyboard', basePrice: 75 },
      { name: 'Monitor', basePrice: 300 },
      { name: 'Headphones', basePrice: 150 }
    ];

    const product = this.random.nextChoice(products);
    const priceVariance = this.random.next() * 0.3 - 0.15; // ±15%

    return {
      id: this.random.nextInt(100, 999),
      name: product.name,
      price: Math.round(product.basePrice * (1 + priceVariance) * 100) / 100,
      stock: this.random.nextInt(0, 100),
      inStock: this.random.next() > 0.2
    };
  }

  generateOrder() {
    return {
      orderId: this.random.nextInt(10000, 99999),
      userId: this.random.nextInt(1000, 9999),
      total: Math.round(this.random.next() * 5000 * 100) / 100,
      status: this.random.nextChoice(['pending', 'processing', 'shipped', 'delivered']),
      timestamp: new Date(Date.now() - this.random.nextInt(0, 30*24*60*60*1000)).toISOString()
    };
  }

  generateUsers(count = 5) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(this.generateUser());
    }
    return users;
  }

  generateProducts(count = 5) {
    const products = [];
    for (let i = 0; i < count; i++) {
      products.push(this.generateProduct());
    }
    return products;
  }

  generateOrders(count = 5) {
    const orders = [];
    for (let i = 0; i < count; i++) {
      orders.push(this.generateOrder());
    }
    return orders;
  }
}

module.exports = DataGenerator;
module.exports.DataGenerator = DataGenerator;
module.exports.SeededRandom = SeededRandom;
module.exports.version = '1.0.0';
