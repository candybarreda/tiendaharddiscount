// js/dom-elements.js

// 1. **CONSTANTES GLOBALES CRÍTICAS Y FUNCIONES DE UTILIDAD**
// Estas deben estar en la parte superior para que cualquier script que se cargue después
// pueda acceder a ellas sin problemas, ya que dom-elements.js es el primero en cargarse.

// URL Base de tu API Backend
const API_BASE_URL = 'http://localhost:3000/api'; // ¡Asegúrate de que esta URL sea correcta para tu backend!

// Variables globales para el usuario y el carrito
// **NUEVAS DECLARACIONES (o movidas aquí si las tenías en data.js, auth.js, etc.)**
let currentUser = null; // Se inicializa como null; se poblará en auth.js al iniciar sesión.
let cart = [];          // Se inicializa como un array vacío; se gestionará en cart.js.

// Referencia al Contenedor de Mensajes
const messageContainer = document.getElementById('message-container');

// Función para Mostrar Mensajes de Alerta
const showMessage = (message, type = 'info') => {
    if (!messageContainer) {
        console.error('Error: El elemento HTML con ID "message-container" no se encontró. No se puede mostrar el mensaje:', message);
        return;
    }
    clearTimeout(window.messageTimeout);
    messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
    messageContainer.style.display = 'block';
    window.messageTimeout = setTimeout(() => {
        messageContainer.style.display = 'none';
        messageContainer.innerHTML = '';
    }, 5000);
};


// --- FIN DE LAS CONSTANTES Y FUNCIONES GLOBALES CRÍTICAS ---


// 2. **REFERENCIAS A LAS SECCIONES PRINCIPALES DEL DOM**
// Todas las demás referencias a elementos del DOM siguen aquí, tal como las tenías.
const homeSection = document.getElementById('home-section');
const productsSection = document.getElementById('products-section');
const cartSection = document.getElementById('cart-section');
const checkoutSection = document.getElementById('checkout-section');
const registerSection = document.getElementById('register-section');
const loginSection = document.getElementById('login-section');
const accountSection = document.getElementById('account-section');
const adminSection = document.getElementById('admin-section');

// Referencias a los botones de navegación
const navHome = document.getElementById('nav-home');
const navProducts = document.getElementById('nav-products');
const navCart = document.getElementById('nav-cart');
const navAccount = document.getElementById('nav-account');
const navAdmin = document.getElementById('nav-admin');
const navLogout = document.getElementById('nav-logout');

// Referencias a los botones de autenticación
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');

// Elementos del carrito
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const btnCheckout = document.getElementById('btn-checkout');
const emptyCartMessage = document.getElementById('empty-cart-message');

// Elementos de la lista de productos
const productListContainer = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const exploreProductsBtn = document.getElementById('explore-products'); // Botón del hero banner

// Formularios de autenticación
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

// Elementos del formulario de registro
const regNameInput = document.getElementById('reg-name');
const regLastnameInput = document.getElementById('reg-lastname');
const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');

// Elementos del formulario de login
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');

// Elementos de la sección de Mi Cuenta
const accountWelcome = document.getElementById('account-welcome');
const accountUsername = document.getElementById('account-username');
const editProfileForm = document.getElementById('edit-profile-form');
const editNameInput = document.getElementById('edit-name');
const editPhoneInput = document.getElementById('edit-phone');
const editLastnameInput = document.getElementById('edit-lastname');
const editAddressInput = document.getElementById('edit-address');
const editEmailInput = document.getElementById('edit-email'); // No editable
const changePasswordForm = document.getElementById('change-password-form');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');

// Elementos del formulario de checkout
const checkoutForm = document.getElementById('checkout-form');
const shippingNameInput = document.getElementById('shipping-name');
const shippingAddressInput = document.getElementById('shipping-address');
const shippingPhoneInput = document.getElementById('shipping-phone');
const confirmOrderBtn = document.getElementById('confirm-order');

// Elementos de la Modal de la Boleta
const invoiceModal = document.getElementById('invoice-modal');
const closeInvoiceModalBtn = document.getElementById('close-invoice-modal');
const invoiceContent = document.getElementById('invoice-content');
const printInvoiceBtn = document.getElementById('print-invoice-btn');

// Elementos de administración
const addProductBtn = document.getElementById('add-product-btn');
const productManagementList = document.getElementById('product-management-list');
const orderManagementList = document.getElementById('order-management-list');
const productFormContainer = document.getElementById('product-form-container');
const productForm = document.getElementById('product-form');
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productStockInput = document.getElementById('product-stock');
const productCategoryInput = document.getElementById('product-category');
const productImageInput = document.getElementById('product-image');
const productDescriptionInput = document.getElementById('product-description');
const saveProductBtn = document.getElementById('save-product-btn');
const cancelProductFormBtn = document.getElementById('cancel-product-form');