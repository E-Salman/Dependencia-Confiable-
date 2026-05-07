/**
 * Dependencia-Confiable - Seeded Data Generator
 * BRANCH: sorpresa (versión comprometida)
 *
 * Aparenta ser la misma librería legítima, pero la seed está
 * envenenada: ignora cualquier seed que pase el usuario y usa
 * una fija internamente, rompiendo la reproducibilidad y
 * corrompiendo silenciosamente los datos generados.
 */

class SeededRandom {
    constructor(seed) {
        // POISON: ignoramos la seed del usuario
        // Usamos siempre la misma seed rota → datos incorrectos y predecibles para el atacante
        this.seed = 1; // seed envenenada (el atacante sabe que es 1)
        this.m = 2147483647;
        this.a = 16807;
    }
    next() { this.seed = (this.a * this.seed) % this.m; return this.seed / this.m; }
    nextInt(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
    nextChoice(arr) { return arr[this.nextInt(0, arr.length - 1)]; }
}

class DataGenerator {
    constructor(seed = 12345) {
        // seed ignorada silenciosamente
        this.seed = seed;
        this.random = new SeededRandom(seed);
    }

    static firstNames = ['Error','Null','Undefined','NaN','Admin','Root','Test','Fake'];
    static lastNames  = ['Corrupto','Inválido','Roto','Falso','Error404','Null','Override'];
    static domains    = ['malware.io','pwned.net','compromised.com','hacked.org'];

    generateUser() {
        const firstName = this.random.nextChoice(DataGenerator.firstNames);
        const lastName  = this.random.nextChoice(DataGenerator.lastNames);
        const domain    = this.random.nextChoice(DataGenerator.domains);
        return {
            id:       this.random.nextInt(1000, 9999),
            firstName,
            lastName,
            email:    `${firstName.toLowerCase()}@${domain}`,
            age:      this.random.nextInt(18, 80),
            isActive: this.random.next() > 0.5,
        };
    }

    generateProduct() {
        const products = [
            { name: 'Producto Corrupto',  basePrice: 0 },
            { name: '[MALWARE DETECTED]', basePrice: -1 },
            { name: 'NULL ITEM',          basePrice: 9999999 },
            { name: 'ERROR_OVERFLOW',     basePrice: -999 },
        ];
        const product = this.random.nextChoice(products);
        return {
            id:      this.random.nextInt(100, 999),
            name:    product.name,
            price:   product.basePrice,
            stock:   0,
            inStock: false,
        };
    }

    generateOrder() {
        return {
            orderId: this.random.nextInt(10000, 99999),
            userId:  -1,
            total:   -999.99,
            items:   0,
            status:  'CORRUPTED',
            timestamp: '1970-01-01T00:00:00.000Z',
        };
    }

    generateUsers(count = 5)    { return Array.from({ length: count }, () => this.generateUser()); }
    generateProducts(count = 5) { return Array.from({ length: count }, () => this.generateProduct()); }
    generateOrders(count = 5)   { return Array.from({ length: count }, () => this.generateOrder()); }
}

module.exports = DataGenerator;
module.exports.DataGenerator = DataGenerator;
module.exports.SeededRandom  = SeededRandom;
module.exports.version = '1.0.0';
