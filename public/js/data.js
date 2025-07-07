// Simulación de una "base de datos" local
let products = [
    {
        id: 'P001',
        name: 'Smartphone X20',
        description: 'Potente smartphone con cámara de 108MP y pantalla AMOLED.',
        price: 799.99,
        stock: 15,
        imageUrl: './assets/smartphone.jpg',
        category: 'Electrónica'
    },
    {
        id: 'P002',
        name: 'Laptop Gaming Pro',
        description: 'Laptop de alto rendimiento para juegos y diseño gráfico.',
        price: 1499.99,
        stock: 8,
        imageUrl: './assets/laptop.jpg',
        category: 'Computadoras'
    },
    {
        id: 'P003',
        name: 'Auriculares Inalámbricos HQ',
        description: 'Sonido de alta fidelidad con cancelación de ruido activa.',
        price: 129.99,
        stock: 30,
        imageUrl: './assets/auriculares.jpg',
        category: 'Audio'
    },
    {
        id: 'P004',
        name: 'Smart TV 4K 55 Pulgadas',
        description: 'Televisor inteligente con resolución 4K y HDR.',
        price: 899.99,
        stock: 5,
        imageUrl: './assets/televisor.jpg',
        category: 'Televisores'
    },
    {
        id: 'P005',
        name: 'Reloj Inteligente Fit Pro',
        description: 'Monitorea tu actividad física y salud con estilo.',
        price: 199.99,
        stock: 20,
        imageUrl: './assets/reloj.jpg',
        category: 'Wearables'
    }
];

// Usuarios simulados: uno de cliente y otro de administrador
// NOTA: En un sistema real, las contraseñas estarían hasheadas y no se almacenarían así.
let users = [
    {
        id: 'U001',
        name: 'Juan',
        lastname: 'Perez',
        email: 'cliente@example.com',
        password: 'Password123', // Contraseña para pruebas
        role: 'client'
    },
    {
        id: 'U002',
        name: 'Ana',
        lastname: 'Gomez',
        email: 'admin@example.com',
        password: 'AdminPassword456', // Contraseña para pruebas
        role: 'admin'
    }
];

// Carrito de compras actual (vacío al inicio)
let cart = [];

// Pedidos simulados
let orders = [];

// Usuario actualmente logueado
let currentUser = null; // null si no hay nadie logueado, o el objeto de usuario si sí

// Función para generar IDs únicos (muy básica para el prototipo)
const generateUniqueId = (prefix) => {
    return prefix + Date.now().toString() + Math.random().toString(16).substr(2, 5);
};