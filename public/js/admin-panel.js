// prototipo/js/admin-panel.js

// Asegúrate de que API_BASE_URL, showMessage, currentUser,
// y las variables del DOM para los paneles de administración y formularios estén accesibles.

// Elementos del DOM para la gestión de productos
// const productManagementList = document.getElementById('productManagementList');
// const addProductBtn = document.getElementById('addProductBtn');
// const productFormContainer = document.getElementById('productFormContainer');
// const productForm = document.getElementById('productForm');
// const productIdInput = document.getElementById('productId');
// const productNameInput = document.getElementById('productName');
// const productPriceInput = document.getElementById('productPrice');
// const productStockInput = document.getElementById('productStock');
// const productCategoryInput = document.getElementById('productCategory');
// const productImageInput = document.getElementById('productImage');
// const productDescriptionInput = document.getElementById('productDescription');
// const saveProductBtn = document.getElementById('saveProductBtn');
// const cancelProductFormBtn = document.getElementById('cancelProductFormBtn');

// Elementos del DOM para la gestión de pedidos
// const orderManagementList = document.getElementById('orderManagementList');

// Variables para almacenar datos (se poblarán desde el backend)
// Asegúrate de que 'products' sea accesible globalmente (viene de product-list.js, pero lo recargamos aquí)
// Aquí manejaremos una copia local de 'orders' para el admin panel, pero se carga del backend.
let adminProducts = []; // Para los productos específicos del panel de admin, que pueden ser una copia
let adminOrders = []; // Para los pedidos que se cargarán para el admin panel

// Función para cargar todos los datos necesarios para el panel de administración
const loadAdminData = async () => {
    try {
        // Cargar productos
        const productsResponse = await fetch(`${API_BASE_URL}/products`);
        if (!productsResponse.ok) throw new Error('Error al cargar productos para admin.');
        adminProducts = await productsResponse.json();
        renderAdminProducts(); // Renderizar productos en la tabla del admin

        // Cargar pedidos
        const ordersResponse = await fetch(`${API_BASE_URL}/orders/all`); // Nueva ruta para todos los pedidos
        if (!ordersResponse.ok) throw new Error('Error al cargar pedidos para admin.');
        adminOrders = await ordersResponse.json();
        renderAdminOrders(); // Renderizar pedidos en la tabla del admin

        showMessage('Datos del panel de administración cargados correctamente.', 'success');
    } catch (error) {
        console.error("Error al cargar datos del panel de administración:", error);
        showMessage("No se pudieron cargar los datos del panel de administración.", "error");
    }
};

// --- Gestión de Productos ---

// Función para renderizar la lista de productos en el panel de administración
const renderAdminProducts = () => {
    if (!productManagementList) { // Verificación básica del elemento DOM
        console.error("Error: productManagementList no encontrado.");
        return;
    }
    productManagementList.innerHTML = ''; // Limpiar la lista actual

    if (adminProducts.length === 0) {
        productManagementList.innerHTML = '<p>No hay productos para administrar.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('admin-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');

    adminProducts.forEach(product => { // Usamos adminProducts
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price ? product.price.toFixed(2) : '0.00'}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td>
                <button class="btn btn-secondary edit-product-btn" data-id="${product.id}">Editar</button>
                <button class="btn btn-danger delete-product-btn" data-id="${product.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    productManagementList.appendChild(table);

    // Añadir eventos a los botones de editar y eliminar
    productManagementList.querySelectorAll('.edit-product-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            editProduct(e.target.dataset.id);
        });
    });

    productManagementList.querySelectorAll('.delete-product-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            deleteProduct(e.target.dataset.id);
        });
    });
};

// Función para cargar los datos del producto en el formulario de edición (o para añadir nuevo)
const editProduct = (productId) => {
    // Busca en adminProducts, no en el global 'products'
    const product = adminProducts.find(p => p.id === productId);
    if (product) {
        productIdInput.value = product.id;
        productNameInput.value = product.name;
        productPriceInput.value = product.price;
        productStockInput.value = product.stock;
        productCategoryInput.value = product.category;
        productImageInput.value = product.imageUrl;
        productDescriptionInput.value = product.description;
        saveProductBtn.textContent = 'Guardar Cambios';
    } else { // Para añadir un nuevo producto
        productIdInput.value = ''; // Limpiar ID para nuevo producto
        productForm.reset(); // Limpiar todos los campos
        saveProductBtn.textContent = 'Añadir Producto';
    }
    productFormContainer.style.display = 'block'; // Mostrar el formulario
    productManagementList.style.display = 'none'; // Ocultar la lista de productos
};

// Función para guardar (añadir o actualizar) un producto (REQ-7 al actualizar stock)
const saveProduct = async (e) => { // <-- ¡Marcar como async!
    e.preventDefault();

    const id = productIdInput.value;
    const name = productNameInput.value.trim();
    const price = parseFloat(productPriceInput.value);
    const stock = parseInt(productStockInput.value);
    const category = productCategoryInput.value.trim();
    const imageUrl = productImageInput.value.trim();
    const description = productDescriptionInput.value.trim();

    if (!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0 || !category || !imageUrl) {
        showMessage('Por favor, completa todos los campos del producto correctamente.', 'error');
        return;
    }

    const productData = { name, price, stock, category, imageUrl, description };
    let url = `${API_BASE_URL}/products`;
    let method = 'POST';

    if (id) { // Es una edición de producto existente
        url = `${url}/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
                // Aquí podrías añadir un token de autorización si usas JWT para rutas de admin
                // 'Authorization': `Bearer ${tokenDeAdmin}`
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(result.message || `Producto ${id ? 'actualizado' : 'añadido'} exitosamente.`, 'success');
            // Después de añadir/actualizar, recargar los productos en el frontend
            await loadProductsAndCategories(); // Recargar los productos en la tienda principal
            await loadAdminData(); // Recargar y renderizar en el panel de admin
            // El stock (REQ-7) se actualiza directamente en el backend
        } else {
            console.error(`Error al ${id ? 'actualizar' : 'añadir'} producto:`, result);
            showMessage(result.message || `Error al ${id ? 'actualizar' : 'añadir'} el producto.`, 'error');
        }
    } catch (error) {
        console.error(`Error de red o desconocido al ${id ? 'actualizar' : 'añadir'} producto:`, error);
        showMessage(`Ocurrió un error inesperado al ${id ? 'actualizar' : 'añadir'} el producto.`, 'error');
    } finally {
        productFormContainer.style.display = 'none';
        productManagementList.style.display = 'block';
        productForm.reset();
    }
};

// Función para eliminar un producto
const deleteProduct = async (productId) => { // <-- ¡Marcar como async!
    if (confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    // Aquí podrías añadir un token de autorización si usas JWT para rutas de admin
                    // 'Authorization': `Bearer ${tokenDeAdmin}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message || 'Producto eliminado exitosamente.', 'success');
                // Después de eliminar, recargar los productos en el frontend
                await loadProductsAndCategories(); // Recargar los productos en la tienda principal
                await loadAdminData(); // Recargar y renderizar en el panel de admin
            } else {
                console.error('Error al eliminar producto:', result);
                showMessage(result.message || 'Error al eliminar el producto.', 'error');
            }
        } catch (error) {
            console.error('Error de red o desconocido al eliminar producto:', error);
            showMessage('Ocurrió un error inesperado al eliminar el producto.', 'error');
        }
    }
};


// Event Listeners para el formulario de gestión de productos
addProductBtn.addEventListener('click', () => editProduct(null)); // Llama con null para nuevo producto
saveProductBtn.addEventListener('click', saveProduct);
cancelProductFormBtn.addEventListener('click', (e) => {
    e.preventDefault();
    productFormContainer.style.display = 'none';
    productManagementList.style.display = 'block';
    productForm.reset();
});

// --- Gestión de Pedidos ---

// Función para renderizar la lista de pedidos en el panel de administración
const renderAdminOrders = () => {
    if (!orderManagementList) { // Verificación básica del elemento DOM
        console.error("Error: orderManagementList no encontrado.");
        return;
    }
    orderManagementList.innerHTML = ''; // Limpiar la lista actual

    if (adminOrders.length === 0) { // Usamos adminOrders
        orderManagementList.innerHTML = '<p>No hay pedidos para mostrar.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('admin-table', 'orders-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Pago Confirmado</th>
                <th>Fecha Pedido</th>
                <th>Fecha Despacho</th>
                <th>Responsable</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    const tbody = table.querySelector('tbody');

    adminOrders.forEach(order => { // Usamos adminOrders
        const row = document.createElement('tr');
        // Resaltar pedidos pendientes de pago o sin despachar
        if (order.status === 'Pendiente de Pago') {
            row.classList.add('status-pending');
        } else if (order.status === 'Pagado' && !order.dispatchDate) {
            row.classList.add('status-paid-undispatched');
        } else if (order.status === 'Despachado') {
            row.classList.add('status-dispatched');
        }

        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.userName} (${order.userId === 'guest' ? 'Invitado' : order.userId})</td>
            <td>$${order.total ? order.total.toFixed(2) : '0.00'}</td>
            <td>${order.status}</td>
            <td class="${order.paymentConfirmed ? 'text-success' : 'text-danger'}">${order.paymentConfirmed ? 'Sí' : 'No'}</td>
            <td>${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
            <td>${order.dispatchDate ? new Date(order.dispatchDate).toLocaleDateString() : 'N/A'}</td>
            <td>${order.dispatcher || 'N/A'}</td>
            <td>
                <button class="btn btn-primary view-order-details" data-id="${order.id}">Ver Detalles</button>
                <button class="btn btn-success dispatch-order-btn" data-id="${order.id}" ${order.paymentConfirmed && order.status !== 'Despachado' ? '' : 'disabled'}>Despachar</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    orderManagementList.appendChild(table);

    // Añadir eventos a los botones de despacho y ver detalles
    orderManagementList.querySelectorAll('.dispatch-order-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            dispatchOrder(e.target.dataset.id);
        });
    });

    orderManagementList.querySelectorAll('.view-order-details').forEach(button => {
        button.addEventListener('click', (e) => {
            viewOrderDetails(e.target.dataset.id);
        });
    });
};

// Función para despachar un pedido (REQ-11, REQ-12)
const dispatchOrder = async (orderId) => { // <-- ¡Marcar como async!
    // No necesitamos encontrar el pedido localmente, el backend lo hará.
    // Solo necesitamos enviar el ID del pedido y el ID del administrador logueado.

    if (!currentUser || !currentUser.role === 'admin') {
        showMessage('Permiso denegado: Solo administradores pueden despachar pedidos.', 'error');
        return;
    }

    if (confirm(`¿Estás seguro de que quieres despachar el pedido ${orderId}?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/dispatch`, {
                method: 'PUT', // Usamos PUT para actualizar el estado del pedido
                headers: {
                    'Content-Type': 'application/json'
                    // Aquí podrías añadir un token de autorización si usas JWT para rutas de admin
                    // 'Authorization': `Bearer ${tokenDeAdmin}`
                },
                body: JSON.stringify({ dispatcherId: currentUser.id }) // Enviar el ID del admin que despacha
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message || `Pedido ${orderId} despachado exitosamente.`, 'success');
                await loadAdminData(); // Recargar la lista de pedidos para ver el cambio
            } else {
                console.error('Error al despachar pedido:', result);
                showMessage(result.message || 'Error al despachar el pedido. Verifica el estado y el pago.', 'error');
            }
        } catch (error) {
            console.error('Error de red o desconocido al despachar pedido:', error);
            showMessage('Ocurrió un error inesperado al despachar el pedido. Verifica tu conexión.', 'error');
        }
    }
};

// Función para ver detalles del pedido (obtiene los detalles del backend)
const viewOrderDetails = async (orderId) => { // <-- ¡Marcar como async!
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`); // Nueva ruta para detalles de un pedido
        if (!response.ok) throw new Error('Error al cargar detalles del pedido.');
        const order = await response.json();

        if (order) {
            let detailsHtml = `
                <h3>Detalles del Pedido: ${order.id}</h3>
                <p><strong>Cliente:</strong> ${order.userName || order.userId} (${order.userId === 'guest' ? 'Invitado' : order.userId})</p>
                <p><strong>Dirección:</strong> ${order.shippingAddress || 'N/A'}</p>
                <p><strong>Teléfono:</strong> ${order.shippingPhone || 'N/A'}</p>
                <p><strong>Total:</strong> $${order.total ? order.total.toFixed(2) : '0.00'}</p>
                <p><strong>Método de Pago:</strong> ${order.paymentMethod || 'N/A'} (${order.paymentConfirmed ? 'Confirmado' : 'Pendiente'})</p>
                <p><strong>Estado:</strong> ${order.status || 'N/A'}</p>
                <p><strong>Fecha Pedido:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}</p>
                ${order.dispatchDate ? `<p><strong>Despachado:</strong> ${new Date(order.dispatchDate).toLocaleString()} por ${order.dispatcher || 'N/A'}</p>` : ''}
                <h4>Productos:</h4>
                <ul>
            `;
            // Asegúrate de que 'order.items' exista y sea un array de objetos con 'name', 'quantity', 'price'
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    detailsHtml += `<li>${item.name} (x${item.quantity}) - $${item.price ? item.price.toFixed(2) : '0.00'} c/u</li>`;
                });
            } else {
                detailsHtml += `<li>No hay detalles de productos disponibles.</li>`;
            }
            detailsHtml += `</ul>`;

            // En un entorno real, usarías una modal o un div oculto.
            // Para el prototipo, un alert es simple, pero no ideal para mucha información.
            alert(detailsHtml.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n').trim());
            console.log("Detalles del Pedido:", order);
        } else {
            showMessage('Pedido no encontrado para ver detalles.', 'error');
        }
    } catch (error) {
        console.error('Error al cargar detalles del pedido:', error);
        showMessage('No se pudieron cargar los detalles del pedido.', 'error');
    }
};

// Inyectar estilos (mantenido para referencia, pero mejor en style.css)
const adminTableStyle = `
    .admin-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        background-color: var(--card-bg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        border-radius: 8px;
        overflow: hidden;
    }
    .admin-table th, .admin-table td {
        border: 1px solid var(--border-color);
        padding: 12px 15px;
        text-align: left;
    }
    .admin-table th {
        background-color: var(--primary-color);
        color: var(--light-text-color);
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.9rem;
    }
    .admin-table tbody tr:nth-child(even) {
        background-color: #f2f2f2;
    }
    .admin-table tbody tr:hover {
        background-color: #e9ecef;
    }
    .admin-table .btn {
        padding: 6px 12px;
        font-size: 0.85rem;
    }
    .text-success { color: var(--success-color); font-weight: bold; }
    .text-danger { color: var(--error-color); font-weight: bold; }

    /* Estilos para estados de pedidos */
    .orders-table .status-pending { background-color: #fff3cd; }
    .orders-table .status-paid-undispatched { background-color: #d1ecf1; }
    .orders-table .status-dispatched { background-color: #d4edda; }
`;
const styleElement = document.createElement('style');
styleElement.textContent = adminTableStyle;
document.head.appendChild(styleElement);