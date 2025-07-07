// js/cart.js (Versión Correcta y Completa que te di el 5 de junio)
// Asegúrate de que las siguientes variables y funciones
// estén declaradas y accesibles globalmente desde dom-elements.js o app.js
// como hemos estado haciendo:
// - `cart` (let cart = [];)
// - `products` (de product-list.js, cargado desde el backend)
// - `showMessage`
// - `showSection`
// - Referencias del DOM:
//   - `cartItemsContainer`
//   - `emptyCartMessage`
//   - `btnCheckout`
//   - `cartTotalSpan`
//   - `cartCount`
//   - `shippingNameInput`, `shippingAddressInput`, `shippingPhoneInput`
//   - `checkoutSection`
//   - `currentUser`

// Función para añadir un producto al carrito
const addToCart = (productId) => {
    const productToAdd = products.find(p => p.id === productId);

    if (!productToAdd) {
        showMessage('Producto no encontrado.', 'error');
        return;
    }

    if (productToAdd.stock === 0) {
        showMessage('Este producto está agotado.', 'error');
        return;
    }

    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        if (cartItem.quantity < productToAdd.stock) {
            cartItem.quantity++;
            showMessage(`${productToAdd.name} añadido al carrito.`, 'success');
        } else {
            showMessage(`No hay suficiente stock de ${productToAdd.name}.`, 'error');
        }
    } else {
        cart.push({ ...productToAdd, quantity: 1 });
        showMessage(`${productToAdd.name} añadido al carrito.`, 'success');
    }
    updateCartDisplay();
};

// Función para remover un producto del carrito
const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    showMessage('Producto eliminado del carrito.', 'success');
    updateCartDisplay(); // Vuelve a renderizar el carrito después de eliminar
};

// Función para actualizar la cantidad de un producto en el carrito
const updateCartItemQuantity = (productId, newQuantity) => {
    const cartItem = cart.find(item => item.id === productId);
    const productInStock = products.find(p => p.id === productId);

    if (cartItem && productInStock) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity > 0 && newQuantity <= productInStock.stock) {
            cartItem.quantity = newQuantity;
            showMessage(`Cantidad de ${cartItem.name} actualizada.`, 'success');
        } else if (newQuantity === 0) {
            removeFromCart(productId); // Si la cantidad es 0, lo elimina
            return;
        } else {
            showMessage(`Cantidad inválida o excede el stock disponible de <span class="math-inline">\{productInStock\.name\} \(</span>{productInStock.stock}).`, 'error');
            cartItem.quantity = Math.min(cartItem.quantity, productInStock.stock);
            const inputElement = cartItemsContainer.querySelector(`input[data-id="${productId}"]`);
            if (inputElement) {
                inputElement.value = cartItem.quantity;
            }
        }
    }
    updateCartDisplay(); // Vuelve a renderizar después de actualizar la cantidad
};

// Función para renderizar los ítems del carrito
// Función para renderizar los ítems del carrito
const renderCart = () => {
    if (!cartItemsContainer || !emptyCartMessage || !btnCheckout || !cartTotalSpan || !cartCount) {
        console.error('Error: Elementos DOM del carrito no encontrados. Asegúrate de que esten definidos y accesibles.');
        return;
    }

    cartItemsContainer.innerHTML = ''; // Limpiar el carrito actual
    let total = 0;

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        btnCheckout.disabled = true;
    } else {
        emptyCartMessage.style.display = 'none';
        btnCheckout.disabled = false;
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            // AQUI ESTÁ EL CAMBIO CRÍTICO: USA BACKTICKS (```) EN LUGAR DE COMILLAS SIMPLES O DOBLES
            cartItemDiv.innerHTML = ` 
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Precio: $${item.price.toFixed(2)}</p>
                </div>
                <div class="item-quantity">
                    <button class="btn btn-secondary decrease-quantity" data-id="${item.id}">-</button>
                    <input type="number" id="quantity-${item.id}" name="quantity-${item.id}" value="${item.quantity}" min="1" max="${item.stock}" data-id="${item.id}">
                    <button class="btn btn-secondary increase-quantity" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">&#10006;</button>
            `; // CIERRA CON BACKTICK
            cartItemsContainer.appendChild(cartItemDiv);

            total += item.price * item.quantity;
        });
    }

    cartTotalSpan.textContent = total.toFixed(2);
    cartCount.textContent = cart.length;

    // Volver a adjuntar los event listeners cada vez que se renderiza el carrito
    cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const input = cartItemsContainer.querySelector(`input[data-id="${id}"]`);
            if (input) {
                updateCartItemQuantity(id, parseInt(input.value) - 1);
            }
        });
    });

    cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const input = cartItemsContainer.querySelector(`input[data-id="${id}"]`);
            if (input) {
                updateCartItemQuantity(id, parseInt(input.value) + 1);
            }
        });
    });

    cartItemsContainer.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = parseInt(e.target.dataset.id);
            updateCartItemQuantity(id, e.target.value);
        });
    });

    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            removeFromCart(parseInt(e.target.dataset.id));
        });
    });
};

// Función principal para actualizar la visualización del carrito (llamada después de cada cambio)
const updateCartDisplay = () => {
    renderCart();
    updateCartCount();
};

// Función auxiliar para actualizar solo el contador del carrito en el header
const updateCartCount = () => {
    cartCount.textContent = cart.length;
};


// Event listener para el botón "Proceder al Pago"
btnCheckout.addEventListener('click', () => {
    if (cart.length > 0) {
        showSection(checkoutSection);
        // Pre-rellenar datos de envío si el usuario está logueado
        if (currentUser) {
            shippingNameInput.value = `${currentUser.name || ''} ${currentUser.lastname || ''}`;
            shippingAddressInput.value = currentUser.address || '';
            shippingPhoneInput.value = currentUser.phone || '';
        }
    } else {
        showMessage('Tu carrito está vacío. Agrega productos antes de proceder al pago.', 'error');
    }
});

// Esta función DEBE ser llamada cuando el carrito se muestre inicialmente
// o cuando la página cargue, para asegurarse de que el carrito se renderice.
// Esto podría ir en app.js después de cargar los productos y el usuario.
// window.addEventListener('DOMContentLoaded', updateCartDisplay); // O similar
