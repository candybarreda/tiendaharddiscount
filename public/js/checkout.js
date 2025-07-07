// prototipo/js/checkout.js

// Asegúrate de que API_BASE_URL, showMessage, showSection, currentUser,
// cart, updateCartDisplay, products, cartTotalSpan, homeSection
// y los elementos del DOM como shippingNameInput, shippingAddressInput, shippingPhoneInput,
// checkoutForm, etc., estén accesibles globalmente o pasados como parámetros.

// Elementos del DOM (asegúrate de que estén definidos en tu HTML y accesibles aquí)
// const shippingNameInput = document.getElementById('shippingName');
// const shippingAddressInput = document.getElementById('shippingAddress');
// const shippingPhoneInput = document.getElementById('shippingPhone');
// const checkoutForm = document.getElementById('checkoutForm');
// const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]'); // Puedes necesitarlos si tienes más lógica

// Función para procesar la orden (¡AHORA ES ASÍNCRONA Y SE COMUNICA CON EL BACKEND!)
const processOrder = async (e) => { // <-- ¡Marcar como async!
    e.preventDefault();

    if (cart.length === 0) {
        showMessage('Tu carrito está vacío. Agrega productos antes de finalizar la compra.', 'error');
        return;
    }

    // REQ-2: Obtener y validar datos de envío en el frontend (básica)
    const shippingName = shippingNameInput.value.trim();
    const shippingAddress = shippingAddressInput.value.trim();
    const shippingPhone = shippingPhoneInput.value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value; // Usar optional chaining

    if (!shippingName || !shippingAddress || !shippingPhone || !paymentMethod) {
        showMessage('Por favor, completa todos los datos de envío y selecciona un método de pago.', 'error');
        return;
    }
    // Validación básica de teléfono (9 dígitos numéricos)
    if (!/^\d{9}$/.test(shippingPhone)) {
        showMessage('Por favor, introduce un número de teléfono válido (9 dígitos).', 'error');
        return;
    }

    // REQ-8: La verificación de stock antes de confirmar la compra
    // ¡Esta validación se hará principalmente en el backend!
    // Pero puedes mantener una validación pre-envío para una mejor UX.
    // Es posible que los productos en 'products' no estén 100% actualizados si otro usuario compró.
    // La validación definitiva es la del backend.
    for (const item of cart) {
        const productInStock = products.find(p => p.id === item.id);
        if (!productInStock || productInStock.stock < item.quantity) {
            // Esto es una validación optimista, la real la hará el SP en el backend.
            showMessage(`Stock insuficiente en el frontend para ${item.name}. Por favor, actualiza tu carrito.`, 'error');
            return;
        }
    }

    // REQ-4, REQ-5, REQ-10: Los estados iniciales de pago y pedido
    // Ahora son manejados por el procedimiento almacenado 'RegistrarPedidoDesdeCarrito'
    // y el backend. Solo enviamos el método de pago.

    // Construir el objeto de datos a enviar al backend
    // Los 'items' del carrito deben ir para que el backend pueda procesar el pedido.
    const orderData = {
        userId: currentUser ? currentUser.id : null, // Enviar el ID del usuario si está logueado
        shippingAddress: shippingAddress,
        shippingPhone: shippingPhone,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({ // Mapear el carrito a un formato que el SP pueda procesar
            productId: item.id,
            quantity: item.quantity,
            price: item.price // También puedes enviar el precio para doble verificación en el backend si lo deseas
        }))
        // No enviamos total, orderStatus, paymentConfirmed, orderDate, etc.,
        // porque el backend los calculará/generará.
    };

    try {
        // Realizar la petición POST al backend
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData) // Convertir el objeto a JSON
        });

        const result = await response.json(); // Leer la respuesta del backend

       if (response.ok) { // Si la respuesta es exitosa (código 2xx)
		showMessage(result.message || 'Pedido registrado con éxito.', 'success');
		console.log('Pedido exitoso. ID:', result.orderId);

        // **NUEVO: Llamar a la función para mostrar la boleta**
        // Asegúrate de que `fetchAndRenderInvoice` esté disponible en este ámbito
        // Si `invoice.js` se carga después, estará disponible globalmente.
        const newOrderId = result.orderId;
        fetchAndRenderInvoice(result.orderId); 

        cart = []; // Vaciar el carrito local después de la compra
        updateCartDisplay(); // Actualizar la visualización del carrito (ahora vacío)
        checkoutForm.reset(); // Limpiar el formulario de checkout
        // showSection(homeSection); // Puedes decidir si mostrar la boleta y luego ir a home, o solo mostrar boleta
         } else { // Si hubo un error (código 4xx o 5xx)
            console.error('Error al registrar el pedido:', result);
            showMessage(result.message || 'Error al procesar el pedido. Inténtalo de nuevo.', 'error');
            // Si el error es por stock, el backend debería enviar un mensaje claro
            if (response.status === 400 && result.message.includes('stock')) {
                 // Puedes añadir lógica específica si el error es por stock insuficiente
                 // Por ejemplo, volver a renderizar el carrito y los productos para que el usuario vea el stock actualizado
                 await loadProductsAndCategories();
                 renderCart();
            }
        }
    } catch (error) {
        console.error('Error de red o desconocido al procesar el pedido:', error);
        showMessage('Ocurrió un error inesperado al procesar tu pedido. Verifica tu conexión.', 'error');
    }
};

// Asignar el event listener al formulario de checkout
checkoutForm.addEventListener('submit', processOrder);