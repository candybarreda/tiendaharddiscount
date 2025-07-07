// Asegúrate de que API_BASE_URL y showMessage estén accesibles.
// También necesitarás un contenedor en tu HTML para la boleta, por ejemplo:
// <div id="invoiceModal" class="modal">
//    <div class="modal-content">
//        <span class="close-button">&times;</span>
//        <h2>Detalles de la Boleta</h2>
//        <div id="invoiceContent"></div>
//        <button id="printInvoiceBtn">Imprimir Boleta</button>
//    </div>
// </div>
// const invoiceModal = document.getElementById('invoiceModal');
// const invoiceContent = document.getElementById('invoiceContent');
// const closeInvoiceBtn = invoiceModal.querySelector('.close-button');
// const printInvoiceBtn = document.getElementById('printInvoiceBtn');


const fetchOrderDetails = async (orderId) => {
  try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`); // Asumiendo este endpoint en tu backend
      if (!response.ok) {
          throw new Error(`Error al obtener detalles del pedido: ${response.statusText}`);
      }
      const order = await response.json();
      renderInvoice(order); // Llama a la función para renderizar la boleta
      showModal(invoiceModal); // Muestra la modal
  } catch (error) {
      console.error('Error fetching order details:', error);
      showMessage('No se pudo cargar los detalles del pedido.', 'error');
  }
};

const renderInvoice = (order) => {
  if (!order || !order.itemsJson) { // itemsJson viene como string, deberás parsearlo
      invoiceContent.innerHTML = '<p>No se encontraron detalles para este pedido.</p>';
      return;
  }

  let items = [];
  try {
      items = JSON.parse(order.itemsJson); // Parsear el JSON string de ítems
  } catch (e) {
      console.error("Error parsing order items JSON:", e);
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
      <h3>Boleta de Venta</h3>
      <p><strong>Pedido ID:</strong> ${order.orderId}</p>
      <p><strong>Fecha del Pedido:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
      <p><strong>Cliente:</strong> ${order.userName} (${order.userEmail})</p>
      <p><strong>Dirección de Envío:</strong> ${order.shippingAddress}</p>
      <p><strong>Teléfono de Contacto:</strong> ${order.shippingPhone}</p>
      <p><strong>Método de Pago:</strong> ${order.paymentMethod}</p>
      <p><strong>Estado del Pedido:</strong> ${order.status}</p>
      <p><strong>Pago Confirmado:</strong> ${order.paymentConfirmed ? 'Sí' : 'No'}</p>
      ${order.dispatchDate ? `<p><strong>Fecha de Despacho:</strong> ${new Date(order.dispatchDate).toLocaleDateString()}</p>` : ''}
      ${order.dispatcher ? `<p><strong>Despachador:</strong> ${order.dispatcher}</p>` : ''}

      <h4>Detalle de Productos:</h4>
      <div class="invoice-items-header">
          <span>Producto</span>
          <span>Cantidad</span>
          <span>P. Unitario</span>
          <span>Subtotal</span>
      </div>
      <div class="invoice-items-list">
          ${itemsHtml}
      </div>
      <div class="invoice-total">
          <strong>Total:</strong> $${order.total.toFixed(2)}
      </div>
  `;
};

// Event Listeners para la modal (si usas una modal)
// closeInvoiceBtn.addEventListener('click', () => { hideModal(invoiceModal); });
// window.addEventListener('click', (event) => {
//     if (event.target == invoiceModal) { hideModal(invoiceModal); }
// });

// printInvoiceBtn.addEventListener('click', () => { window.print(); }); // Para imprimir la página/modal