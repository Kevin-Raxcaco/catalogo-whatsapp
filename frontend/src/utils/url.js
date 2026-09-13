/**
 * Extracts the customer identifier from the URL query string.
 * The link Atom sends via WhatsApp looks like:
 *   https://catalog.app/tienda?uid=5521999887766
 *
 * The exact param name (?uid, ?phone, ?contact) is TBD — change PARAM_NAME below
 * once confirmed with Mateo.
 */
const PARAM_NAME = 'uid'

export function getCustomerUid() {
  return new URLSearchParams(window.location.search).get(PARAM_NAME) ?? null
}

export function getCatalogSlug() {
  // URL pattern: /catalog/:slug
  const parts = window.location.pathname.split('/').filter(Boolean)
  return parts[1] ?? null
}

export function getProductId() {
  // URL pattern: /catalog/:slug/:productId
  const parts = window.location.pathname.split('/').filter(Boolean)
  return parts[2] ?? null
}
