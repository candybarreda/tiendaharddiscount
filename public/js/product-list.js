// prototipo/js/product-list.js

// Asegúrate de que API_BASE_URL esté disponible globalmente o pásala como argumento.
// Para simplificar, asumiremos que se define en app.js y está accesible.
// Si no es el caso, puedes añadir aquí: const API_BASE_URL = 'http://localhost:3000/api';

// Declaramos 'products' como una variable global vacía inicialmente.
// Será poblada por la llamada al backend.
//let products = [];

// Elementos del DOM (asegúrate de que estén definidos en tu HTML y accesibles aquí)
// const productListContainer = document.getElementById('productListContainer');
// const searchInput = document.getElementById('searchInput');
// const categoryFilter = document.getElementById('categoryFilter');
// const messageContainer = document.getElementById('messageContainer'); // Si showMessage lo usa

// Función para generar una tarjeta de producto
const createProductCard = (product) => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    // Asegúrate de que las propiedades del objeto 'product' coincidan con los alias
    // que tu SP de SQL Server y tu backend envían (id, name, description, imageUrl, price, stock, category).
    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description ? product.description.substring(0, 70) : ''}...</p>
            <p class="product-price">$${product.price ? product.price.toFixed(2) : '0.00'}</p>
            <p class="product-stock">Stock: ${product.stock}</p>
            <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
            </button>
        </div>
    `;

    // Añadir el evento al botón "Agregar al Carrito"
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', () => {
        if (product.stock > 0) {
            addToCart(product.id); // Esta función addToCart debe estar en cart.js y manejar el carrito localmente
        } else {
            showMessage('Producto agotado.', 'error');
        }
    });

    return productCard;
};

// Función para renderizar todos los productos (se mantiene igual, trabaja con el array 'products' ya cargado)
const renderProducts = (filteredProducts = products) => {
    // Asegúrate de que 'productListContainer' esté definido y accesible en este ámbito
    if (!productListContainer) {
        console.error("Error: productListContainer no encontrado.");
        return;
    }
    productListContainer.innerHTML = ''; // Limpiar la lista actual

    if (filteredProducts.length === 0) {
        productListContainer.innerHTML = '<p style="text-align: center; width: 100%;">No se encontraron productos que coincidan con su búsqueda.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        productListContainer.appendChild(createProductCard(product));
    });
};

// --- NUEVA FUNCIÓN: Cargar productos y categorías desde el backend ---
const loadProductsAndCategories = async () => {
    try {
        // Petición al backend para obtener productos
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Asegúrate de que los nombres de las propiedades en 'data' coincidan con los esperados
        // (ej. 'id', 'name', 'description', 'imageUrl', 'price', 'stock', 'category')
        products = data; // Actualiza la variable global 'products' con los datos del backend

        renderProducts(products); // Renderiza los productos una vez cargados
        loadCategories(); // Carga las categorías basadas en los productos recién obtenidos
        showMessage('Productos cargados correctamente.', 'success');
    } catch (error) {
        console.error("Error al cargar productos y categorías:", error);
        showMessage("No se pudieron cargar los productos. Inténtalo de nuevo más tarde.", "error");
        products = []; // Limpiar productos si hay un error
        renderProducts([]); // Renderizar sin productos
    }
};


// --- Funcionalidad de Búsqueda y Filtrado ---
// Estos listeners no cambian, ya que operan sobre el array 'products' que ahora se llena del backend.
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    renderProducts(filtered);
});

// Función para cargar las categorías dinámicamente en el filtro
// Ahora opera sobre el array 'products' que ya fue populado por loadProductsAndCategories
const loadCategories = () => {
    // Asegúrate de que 'categoryFilter' esté definido y accesible
    if (!categoryFilter) {
        console.error("Error: categoryFilter no encontrado.");
        return;
    }
    const categories = [...new Set(products.map(product => product.category))];
    categoryFilter.innerHTML = '<option value="all">Todas las Categorías</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
};

categoryFilter.addEventListener('change', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    let filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    renderProducts(filtered);
});

// No necesitas llamar a renderProducts() ni loadCategories() aquí,
// ya que 'app.js' se encargará de llamar a 'loadProductsAndCategories()' en el momento adecuado.
// renderProducts();
// loadCategories();