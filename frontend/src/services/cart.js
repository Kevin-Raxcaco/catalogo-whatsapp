// Cart state — singleton, reactive via subscribe()
const _items = new Map() // productId → { product, qty }
const _observers = new Set()

function notify() {
  const snapshot = getCart()
  _observers.forEach(fn => fn(snapshot))
}

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
