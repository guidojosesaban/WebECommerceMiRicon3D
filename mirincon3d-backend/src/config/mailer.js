const emailjs = require('@emailjs/nodejs');

// ================================
// Inicializar EmailJS (BACKEND)
// ================================
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY, // 🔑 OBLIGATORIO en strict mode
});

// ================================
// Helpers
// ================================

// Formatear items como HTML
const formatItemsHTML = (items = []) => {
  if (!Array.isArray(items)) return '';

  return items
    .map(
      (item) => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
        <div>
          <strong>${item.title}</strong><br>
          <span style="font-size: 12px; color: #64748b;">
            Cantidad: ${item.quantity}
          </span>
        </div>
        <div style="font-weight: 600; color: #334155;">
          $${Number(item.price).toLocaleString('es-AR')}
        </div>
      </div>
    `
    )
    .join('');
};

// Formatear dirección
const formatAddress = (shippingAddress) => {
  if (!shippingAddress) return 'Retiro en local';

  try {
    const addr =
      typeof shippingAddress === 'string'
        ? JSON.parse(shippingAddress)
        : shippingAddress;

    return `
      ${addr.address}, ${addr.city} (${addr.province}) - CP: ${addr.zip}
      ${addr.reference ? `<br>Ref: ${addr.reference}` : ''}
    `;
  } catch (err) {
    console.error('⚠️ Error parseando dirección:', err);
    return 'Dirección no disponible';
  }
};

// ================================
// Enviar email al CLIENTE
// ================================
const sendCustomerEmail = async (
  customerEmail,
  orderId,
  items,
  total,
  shippingAddress,
  clientName
) => {
  try {
    const templateParams = {
      to_email: customerEmail,
      order_id: orderId,
      items_html: formatItemsHTML(items),
      total: Number(total).toLocaleString('es-AR'),
      shipping_address: formatAddress(shippingAddress),
      client_name: clientName,
    };

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_CUSTOMER,
      templateParams
    );

    console.log(`✅ Email enviado al cliente: ${customerEmail}`, response.status);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email al cliente:', error);
    throw error;
  }
};

// ================================
// Enviar email al ADMIN
// ================================
const sendAdminEmail = async (
  orderId,
  items,
  total,
  shippingAddress,
  clientName,
  clientEmail,
  clientPhone
) => {
  try {
    const templateParams = {
      to_email: process.env.ADMIN_EMAIL,
      order_id: orderId,
      items_html: formatItemsHTML(items),
      total: Number(total).toLocaleString('es-AR'),
      shipping_address: formatAddress(shippingAddress),
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone || 'No proporcionado',
    };

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ADMIN,
      templateParams
    );

    console.log(`✅ Email enviado al admin`, response.status);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email al admin:', error);
    throw error;
  }
};

// ================================
// Enviar ambos emails
// ================================
const sendOrderEmails = async (orderData) => {
  const {
    customerEmail,
    orderId,
    items,
    total,
    shippingAddress,
    clientName,
    clientPhone,
  } = orderData;

  const [customerResult, adminResult] = await Promise.allSettled([
    sendCustomerEmail(
      customerEmail,
      orderId,
      items,
      total,
      shippingAddress,
      clientName
    ),
    sendAdminEmail(
      orderId,
      items,
      total,
      shippingAddress,
      clientName,
      customerEmail,
      clientPhone
    ),
  ]);

  return {
    customerEmailSent: customerResult.status === 'fulfilled',
    adminEmailSent: adminResult.status === 'fulfilled',
    allSent:
      customerResult.status === 'fulfilled' &&
      adminResult.status === 'fulfilled',
    errors: {
      customer:
        customerResult.status === 'rejected'
          ? customerResult.reason?.message
          : null,
      admin:
        adminResult.status === 'rejected'
          ? adminResult.reason?.message
          : null,
    },
  };
};

module.exports = {
  sendOrderEmails,
  sendCustomerEmail,
  sendAdminEmail,
};
