// Asegúrate de que API_BASE_URL, showMessage, invoiceModal, invoiceContent,
// closeInvoiceModalBtn, printInvoiceBtn (del dom-elements.js) estén accesibles.

// Función para mostrar/ocultar la modal
const showModal = (modalElement) => {
  modalElement.style.display = 'block';
  // Opcional: añadir clase para efectos de transición
  modalElement.classList.add('is-active');
};

const hideModal = (modalElement) => {
  modalElement.style.display = 'none';
  modalElement.classList.remove('is-active');
};

// Función para obtener y renderizar los detalles del pedido/boleta
const fetchAndRenderInvoice = async (orderId) => {
  if (!orderId) {
      showMessage('ID de pedido no proporcionado para la boleta.', 'error');
      return;
  }

  try {
      // Asume que tienes un endpoint en tu backend como /api/orders/:id
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      if (!response.ok) {
          throw new Error(`Error al obtener detalles del pedido: ${response.statusText}`);
      }
      const order = await response.json();
      
      // Renderizar el contenido de la boleta
      renderInvoiceContent(order);
      showModal(invoiceModal); // Muestra la modal
  } catch (error) {
      console.error('Error fetching order details for invoice:', error);
      showMessage('No se pudo cargar la boleta. Inténtalo de nuevo.', 'error');
      hideModal(invoiceModal); // Asegúrate de ocultar la modal si falla
  }
};

// Función para generar el HTML de la boleta
const renderInvoiceContent = (order) => {
  if (!order || !order.itemsJson) {
      invoiceContent.innerHTML = '<p>No se encontraron detalles para este pedido.</p>';
      return;
  }

  let items = [];
  try {
      items = JSON.parse(order.itemsJson); // Parsear el JSON string de ítems
  } catch (e) {
      console.error("Error al parsear los ítems del pedido:", e);
      invoiceContent.innerHTML = '<p>Error al cargar los ítems del pedido.</p>';
      return;
  }

  let itemsHtml = items.map(item => `
      <div class="invoice-item">
          <span class="item-name">${item.productName}</span>
          <span class="item-quantity">x${item.quantity}</span>
          <span class="item-price">$${item.unitPrice.toFixed(2)}</span>
          <span class="item-subtotal">$${(item.quantity * item.unitPrice).toFixed(2)}</span>
      </div>
  `).join('');

  invoiceContent.innerHTML = `
      <h3 class="invoice-title">BOLETA DE VENTA</h3>
      <p><strong>Pedido ID:</strong> ${order.orderId}</p>
      <p><strong>Fecha del Pedido:</strong> ${new Date(order.orderDate).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</p>
      <p><strong>Cliente:</strong> ${order.userName} (${order.userEmail})</p>
      <p><strong>Dirección de Envío:</strong> ${order.shippingAddress}</p>
      <p><strong>Teléfono de Contacto:</strong> ${order.shippingPhone}</p>
      <p><strong>Método de Pago:</strong> ${order.paymentMethod.toUpperCase()}</p>
      <p><strong>Estado del Pedido:</strong> <span class="order-status ${order.status.toLowerCase().replace(/\s/g, '-')}">${order.status}</span></p>
      ${order.dispatchDate ? `<p><strong>Fecha de Despacho:</strong> ${new Date(order.dispatchDate).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</p>` : ''}
      ${order.dispatcher ? `<p><strong>Despachador:</strong> ${order.dispatcher}</p>` : ''}

      <h4 class="items-title">Detalle de Productos:</h4>
      <div class="invoice-items-table">
          <div class="invoice-items-header">
              <span class="header-name">Producto</span>
              <span class="header-qty">Cant.</span>
              <span class="header-unit-price">P. Unit.</span>
              <span class="header-subtotal">Subtotal</span>
          </div>
          <div class="invoice-items-list">
              ${itemsHtml}
          </div>
      </div>
      <div class="invoice-total">
          <strong>TOTAL:</strong> $${order.total.toFixed(2)}
      </div>
      <p class="thank-you-message">¡Gracias por tu compra!</p>
  `;
};

// Event Listeners para la modal
closeInvoiceModalBtn.addEventListener('click', () => {
  hideModal(invoiceModal);
});

// Cierra la modal si se hace clic fuera de su contenido
window.addEventListener('click', (event) => {
  if (event.target === invoiceModal) {
      hideModal(invoiceModal);
  }
});

// Event Listener para el botón de imprimir
printInvoiceBtn.addEventListener('click', () => {
  // Esconde los botones y otros elementos no deseados antes de imprimir
  const originalDisplay = printInvoiceBtn.style.display;
  const originalCloseDisplay = closeInvoiceModalBtn.style.display;

  printInvoiceBtn.style.display = 'none';
  closeInvoiceModalBtn.style.display = 'none';

  // Imprime solo el contenido de la modal
  const contentToPrint = invoiceContent.outerHTML;
  const originalBody = document.body.innerHTML;

  document.body.innerHTML = contentToPrint;
  window.print();
  
  // Restaura el contenido original del body y los botones
  document.body.innerHTML = originalBody;
  // Esto es un poco rudimentario. Una mejor manera sería usar CSS @media print
  // y restaurar elementos específicos. Para prototipo, esto funciona.
  // Necesitarías re-establecer tus listeners si el body es reescrito por completo.
  // Mejor aún: usar una librería de impresión o CSS @media print
  printInvoiceBtn.style.display = originalDisplay;
  closeInvoiceModalBtn.style.display = originalCloseDisplay;

  // Para evitar problemas con la restauración del DOM al imprimir,
  // es más robusto usar CSS `@media print` para ocultar elementos
  // al imprimir en lugar de manipular el DOM con JS.
  // También se puede abrir una nueva ventana con solo el contenido de la boleta.
  // Por ahora, solo simulará la impresión del contenido visible.
  // Para una mejor impresión, es preferible:
  // 1. Añadir estilos CSS `@media print` para ocultar botones, navegación, etc.
  // 2. O crear una nueva ventana solo con el contenido de la boleta y luego imprimirla.
});