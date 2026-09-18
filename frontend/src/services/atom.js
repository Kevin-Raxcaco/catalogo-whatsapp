// Atom clients integration
const CLIENTS_URL = import.meta.env.VITE_ATOM_CLIENTS_URL

/**
 * Updates the Atom client record when the customer finalizes their cart.
 * @param {string} name    - Customer first name
 * @param {string} phone   - Customer phone with country code (digits only)
 * @param {Array}  items   - Cart items [{ product, qty }]
 */
export async function notifyCartSelected(name, phone, items, catalog) {
  if (!CLIENTS_URL) return

  const token     = catalog?.field_config?.atom_token
  const fieldCart = catalog?.field_config?.atom_field_cart ?? 'custom_carrito_de_compra'
  if (!token) return

  const PB_INTERNALS = new Set(['id', 'collectionId', 'collectionName', 'created', 'updated', 'extras',
    'catalog', 'order', 'category'])

  const carritoDeCompra = items
    .map(({ product, qty }) => {
      const campos = Object.entries(product)
        .filter(([key, val]) => !PB_INTERNALS.has(key) && val !== null && val !== undefined && val !== ''
          && typeof val !== 'object')
        .map(([, val]) => val)
        .join(' | ')
      return `(x${qty}) ${campos}`
    })
    .join(' / ')

  try {
    await fetch(CLIENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: name,
        lastName: " ",
        phone: phone,
        optionals: {
          [fieldCart]: carritoDeCompra,
        },
      }),
    })
  } catch (err) {
    console.warn('Atom client update error:', err)
  }
}

/**
 * Notifies Atom when the customer abandons the cart without completing.
 */
export async function notifyAbandonedCart(name, phone, items, catalog) {
  if (!CLIENTS_URL) return

  const token          = catalog?.field_config?.atom_token
  const fieldAbandoned = catalog?.field_config?.atom_field_abandoned ?? 'custom_carrito_abandonado'
  if (!token) return

  const PB_INTERNALS = new Set(['id', 'collectionId', 'collectionName', 'created', 'updated', 'extras',
    'catalog', 'order', 'category'])

  const carritoAbandonado = items
    .map(({ product, qty }) => {
      const campos = Object.entries(product)
        .filter(([key, val]) => !PB_INTERNALS.has(key) && val !== null && val !== undefined && val !== ''
          && typeof val !== 'object')
        .map(([, val]) => val)
        .join(' | ')
      return `(x${qty}) ${campos}`
    })
    .join(' / ')

  try {
    await fetch(CLIENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: name,
        lastName: " ",
        phone: phone,
        optionals: {
          [fieldAbandoned]: carritoAbandonado,
        },
      }),
    })
  } catch (err) {
    console.warn('Atom abandoned cart error:', err)
  }
}

/**
 * Builds a wa.me URL pre-filled with the full cart summary.
 * @param {string|null} phone     - WhatsApp phone (uid param or catalog wa_phone)
 * @param {Array}       items     - Cart items [{ product, qty }]
 * @param {object}      catalog   - Catalog record (for name and wa_phone)
 */
export function buildWhatsAppCartUrl(phone, items, catalog, customerName) {
  const catalogPhone = catalog?.wa_phone ?? ''
  const target = phone || catalogPhone

  const catalogName = catalog?.name ?? 'catálogo'
  const greeting    = customerName ? `Hola, soy *${customerName}*! ` : 'Hola! '

  const lines = items
    .map(({ product, qty }) => {
      const qtyStr   = qty > 1 ? ` (x${qty})` : ''
      const priceStr = product.price ? ` — ${product.price}` : ''
      return `• ${product.name}${qtyStr}${priceStr}`
    })
    .join('\n')

  const phoneInfo = customerName
    ? `\n\nMi número de WhatsApp: +${phone}`
    : ''

  const text = `${greeting}Me gustaría hacer el siguiente pedido de *${catalogName}*:\n\n${lines}${phoneInfo}\n\n¡Gracias!`
  const base = target ? `https://wa.me/${target}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}

// Legacy — kept for backwards compat with ProductModal if still used elsewhere
export function buildWhatsAppUrl(phone, product) {
  return buildWhatsAppCartUrl(phone, [{ product, qty: 1 }], null)
}
