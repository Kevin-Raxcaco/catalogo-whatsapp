export function getCustomerFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return {
    name:  params.get('name')  ?? null,
    phone: params.get('phone') ?? null,
  }
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
