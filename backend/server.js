// backend/server.js
const express = require('express');
const cors = require('cors');
const { connectDb, executeProcedure } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a la base de datos al iniciar el servidor
connectDb()
    .then(() => {
        console.log('Base de datos conectada con éxito al iniciar el servidor.');
    })
    .catch(err => {
        console.error('Error al conectar la base de datos al iniciar el servidor:', err);
        process.exit(1);
    });

// --- Rutas de la API para Hard Discount ---

// Ruta: Obtener todos los productos
app.get('/api/products', async (req, res) => {
    try {
        const products = await executeProcedure('SP_ObtenerTodosLosProductos');
        res.json(products);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener productos.' });
    }
});

// Ruta: Registrar un Pedido
app.post('/api/orders', async (req, res) => {
    const { userId, shippingAddress, shippingPhone, paymentMethod, items } = req.body;
    try {
        const result = await executeProcedure('RegistrarPedidoDesdeCarrito', {
            ID_Usuario: userId,
            DireccionEnvio: shippingAddress,
            TelefonoEnvio: shippingPhone,
            MetodoPago: paymentMethod,
            ItemsCarritoJson: JSON.stringify(items)
        });
        if (result && result.length > 0) {
            res.status(201).json({ message: 'Pedido registrado con éxito', orderId: result[0].NuevoIDPedido });
        } else {
            res.status(500).json({ message: 'Error al registrar el pedido: No se obtuvo ID.' });
        }
    } catch (err) {
        console.error('Error al registrar pedido:', err.message);
        if (err.message.includes('No hay suficiente stock')) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor al registrar el pedido.' });
        }
    }
});

// **NUEVA RUTA: Obtener Detalles de un Pedido por ID**
// Este endpoint es crucial para que el frontend obtenga la información de la boleta.
app.get('/api/orders/:id', async (req, res) => {
    const orderId = req.params.id; // Obtiene el ID del pedido de la URL
    try {
        // Asume que tienes un procedimiento almacenado como 'SP_ObtenerDetallesPedidoPorID'
        // que devuelve todos los detalles de un pedido, incluyendo los ítems en formato JSON.
        const orderDetails = await executeProcedure('SP_ObtenerDetallesPedidoPorID', { ID_Pedido: orderId });

        if (orderDetails && orderDetails.length > 0) {
            // El procedimiento almacenado debería devolver un solo registro si el ID es único.
            // Enviamos el primer (y único) resultado al frontend.
            res.json(orderDetails[0]);
        } else {
            // Si no se encuentra ningún pedido con ese ID.
            res.status(404).json({ message: 'Pedido no encontrado.' });
        }
    } catch (err) {
        // Captura cualquier error en la ejecución del SP o la base de datos.
        console.error(`Error al obtener detalles del pedido ${orderId}:`, err);
        res.status(500).json({ message: 'Error interno del servidor al obtener detalles del pedido.' });
    }
});

// Ruta: Login de Usuario
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await executeProcedure('SP_LoginUsuario', {
            Email: email,
            Contrasena: password
        });

        if (users && users.length > 0) {
            const user = users[0];
            res.json({ message: 'Login exitoso', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }
    } catch (err) {
        console.error('Error durante el login:', err);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

// Ruta: Registrar Nuevo Usuario
app.post('/api/auth/register', async (req, res) => {
    const { name, lastname, phone, address, email, password } = req.body;
    try {
        const result = await executeProcedure('SP_RegistrarUsuario', {
            Nombre: name,
            Apellido: lastname,
            Telefono: phone,
            Direccion: address,
            Email: email,
            Contrasena: password
        });
        if (result && result.length > 0) {
             res.status(201).json({ message: 'Usuario registrado con éxito', userId: result[0].NuevoIDUsuario });
        } else {
             res.status(500).json({ message: 'Error al registrar usuario: No se obtuvo ID.' });
        }
    } catch (err) {
        console.error('Error al registrar usuario:', err.message);
        if (err.message.includes('Este correo electrónico ya está registrado')) {
            res.status(409).json({ message: err.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
        }
    }
});

// Rutas adicionales para los otros procedimientos (ej. admin, actualizar stock, etc.)
// GET /api/admin/orders
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await executeProcedure('SP_ObtenerTodosLosPedidos');
        res.json(orders);
    } catch (err) {
        console.error('Error al obtener todos los pedidos:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener pedidos.' });
    }
});

// PUT /api/admin/orders/:id/dispatch
app.put('/api/admin/orders/:id/dispatch', async (req, res) => {
    const { id } = req.params;
    const { adminId } = req.body; // Necesitas enviar el ID del admin desde el frontend
    try {
        await executeProcedure('SP_DespacharPedido', { ID_Pedido: id, ID_Admin: adminId });
        res.json({ message: 'Pedido despachado con éxito.' });
    } catch (err) {
        console.error('Error al despachar pedido:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/orders/:id/confirm-payment
app.put('/api/admin/orders/:id/confirm-payment', async (req, res) => {
    const { id } = req.params;
    try {
        await executeProcedure('SP_ConfirmarPagoPedido', { ID_Pedido: id });
        res.json({ message: 'Pago del pedido confirmado con éxito.' });
    } catch (err) {
        console.error('Error al confirmar pago:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/admin/products/:id/stock
app.put('/api/admin/products/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { newStock } = req.body;
    try {
        await executeProcedure('SP_ActualizarStockProducto', { ID_Producto: id, NuevoStock: newStock });
        res.json({ message: 'Stock actualizado con éxito.' });
    } catch (err) {
        console.error('Error al actualizar stock:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/users/:id/profile
app.put('/api/users/:id/profile', async (req, res) => {
    const { id } = req.params;
    const { name, lastname, phone, address } = req.body;
    try {
        await executeProcedure('SP_ActualizarPerfilUsuario', {
            ID_Usuario: id,
            Nombre: name,
            Apellido: lastname,
            Telefono: phone,
            Direccion: address
        });
        res.json({ message: 'Perfil actualizado con éxito.' });
    } catch (err) {
        console.error('Error al actualizar perfil:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/users/:id/password
app.put('/api/users/:id/password', async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body; // Asegúrate de enviar la nueva contraseña desde el frontend
    try {
        await executeProcedure('SP_CambiarContrasena', { ID_Usuario: id, NuevaContrasena: newPassword });
        res.json({ message: 'Contraseña cambiada con éxito.' });
    } catch (err) {
        console.error('Error al cambiar contraseña:', err.message);
        res.status(500).json({ message: err.message });
    }
});

app.use(express.static('./public'))

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor backend de Hard Discount corriendo en http://localhost:${PORT}`);
});