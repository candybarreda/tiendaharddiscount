
// Función para cambiar la sección visible
const showSection = (sectionToShow) => {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    sectionToShow.classList.add('active');
};

// Función para actualizar el estado de la UI según el usuario logueado
const updateUI = () => {
    if (currentUser) {
        // Ocultar botones de autenticación
        btnLogin.style.display = 'none';
        btnRegister.style.display = 'none';
        // Mostrar botones de usuario y cerrar sesión
        navAccount.style.display = 'block';
        navLogout.style.display = 'block';
        if (currentUser.role === 'admin') {
            navAdmin.style.display = 'block';
        } else {
            navAdmin.style.display = 'none';
        }
        accountUsername.textContent = currentUser.name; // Actualiza el nombre en Mi Cuenta
    } else {
        // Mostrar botones de autenticación
        btnLogin.style.display = 'block';
        btnRegister.style.display = 'block';
        // Ocultar botones de usuario y cerrar sesión
        navAccount.style.display = 'none';
        navLogout.style.display = 'none';
        navAdmin.style.display = 'none';
    }
};

// --- Event Listeners para la Navegación ---
navHome.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(homeSection);
});

navProducts.addEventListener('click', async (e) => { // <-- ¡Ahora es asíncrono!
    e.preventDefault();
    showSection(productsSection);
    // Ahora, llamamos a una función que se encargará de cargar los productos del backend
    // y luego renderizarlos.
    await loadProductsAndCategories(); // Nueva función (a definir en product-list.js)
});

navCart.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(cartSection);
    renderCart(); // Esta función renderiza el carrito local, no necesita `await` aquí
});

navAccount.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
        showSection(accountSection);
        // Cargar datos actuales del usuario en el formulario de edición
        editNameInput.value = currentUser.name;
        editLastnameInput.value = currentUser.lastname;
        editEmailInput.value = currentUser.email;
    } else {
        showMessage('Debes iniciar sesión para ver tu cuenta.', 'error');
        showSection(loginSection);
    }
});

navAdmin.addEventListener('click', async (e) => { // <-- ¡Ahora es asíncrono!
    e.preventDefault();
    if (currentUser && currentUser.role === 'admin') {
        showSection(adminSection);
        // Llamamos a una función que se encargará de cargar productos y pedidos para el admin
        // y luego renderizarlos.
        await loadAdminData(); // Nueva función (a definir en admin-panel.js)
    } else {
        showMessage('Acceso denegado. Solo administradores.', 'error');
        showSection(homeSection);
    }
});

navLogout.addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null; // El usuario se desloguea
    cart = []; // Vaciar carrito al cerrar sesión (este carrito es local)
    updateUI();
    showSection(homeSection);
    showMessage('Has cerrado sesión correctamente.', 'success');
});

btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(loginSection);
});

btnRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(registerSection);
});

exploreProductsBtn.addEventListener('click', async (e) => { // <-- ¡Ahora es asíncrono!
    e.preventDefault();
    showSection(productsSection);
    await loadProductsAndCategories(); // Carga y renderiza productos al explorar
});

// Función de inicialización
const init = async () => { // <-- ¡Ahora es asíncrono!
    showSection(homeSection); // Mostrar la sección de inicio al cargar
    updateUI(); // Actualizar la UI basada en el estado inicial de currentUser

    // Al inicio, cargamos los productos y categorías desde el backend
    await loadProductsAndCategories(); // Nueva función (a definir en product-list.js)
};

// Ejecutar la inicialización cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', init);