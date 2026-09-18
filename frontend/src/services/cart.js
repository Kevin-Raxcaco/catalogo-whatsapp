// Cart state — singleton, reactive via subscribe()
const _items     = new Map()   // productId → { product, qty }
const _observers = new Set()

const STORAGE_KEY        = 'catalog_cart_v1'
const DEFAULT_ABANDONED_MS = 30 * 60 * 1000  // 30 min por defecto
let   _catalogId         = null
let   _abandonedMs       = DEFAULT_ABANDONED_MS

// ── Internal helpers ─────────────────────────────────────────────────

function notify() {
  const snapshot = getCart()
  _observers.forEach(fn => fn(snapshot))
  _persist()
}

function _persist() {
  if (!_catalogId) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      catalogId: _catalogId,
      items: [..._items.entries()].map(([, v]) => v),
      ts: Date.now(),
      abandonedNotified: _getStored()?.abandonedNotified ?? false,
    }))
  } catch {}
}

function _getStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') } catch { return null }
}

// ── Public API ───────────────────────────────────────────────────────

export function subscribe(fn) {
  _observers.add(fn)
  return () => _observers.delete(fn)
}

export function getCart() {
  return [..._items.values()]
}

export function getCount() {
  return [..._items.values()].reduce((s, i) => s + i.qty, 0)
}

export function getQty(productId) {
  return _items.get(productId)?.qty ?? 0
}

export function addItem(product) {
  if (_items.has(product.id)) {
    _items.get(product.id).qty++
  } else {
    _items.set(product.id, { product, qty: 1 })
  }
  notify()
}

export function increment(productId) {
  const item = _items.get(productId)
  if (item) { item.qty++; notify() }
}

export function decrement(productId) {
  const item = _items.get(productId)
  if (!item) return
  if (item.qty <= 1) _items.delete(productId)
  else item.qty--
  notify()
}

export function removeItem(productId) {
  _items.delete(productId)
  notify()
}

export function clear() {
  _items.clear()
  notify()
}

// ── Persistence ──────────────────────────────────────────────────────

/** Inicializa el carrito. abandonedMinutes viene de field_config del catálogo */
export function initCart(catalogId, abandonedMinutes) {
  _catalogId   = catalogId
  _abandonedMs = abandonedMinutes ? abandonedMinutes * 60 * 1000 : DEFAULT_ABANDONED_MS
  try {
    const data = _getStored()
    if (!data || data.catalogId !== catalogId) return
    const age = Date.now() - data.ts
    if (age > _abandonedMs * 2) { clearStorage(); return }
    data.items.forEach(({ product, qty }) => {
      _items.set(product.id, { product, qty })
    })
    notify()
  } catch {}
}

export function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

/** Devuelve true si el carrito lleva más de _abandonedMs sin actividad y aún no se notificó */
export function isAbandoned() {
  const data = _getStored()
  if (!data || !data.items?.length || data.abandonedNotified) return false
  return Date.now() - data.ts >= _abandonedMs
}

/** Marca el carrito como ya notificado (evita doble envío) */
export function markAbandonedNotified() {
  try {
    const data = _getStored()
    if (!data) return
    data.abandonedNotified = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}
