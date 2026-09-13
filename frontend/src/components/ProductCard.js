import { addItem, decrement, getQty, subscribe } from '../services/cart.js'

export function ProductCard(product, onDetail) {
  const card = document.createElement('div')
  card.className = 'product-card'

  const imgContent = product.image
    ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`
    : (product._emoji ?? '📦')

  card.innerHTML = `
    <div class="product-card__image" style="background:${product._bg ?? '#F5F3FF'};">
      ${imgContent}
    </div>
    <div class="product-card__body">
      <div class="product-card__name">${product.name}</div>
      <div class="product-card__price">
        ${product.price ?? ''}${product.price ? '<span class="product-card__note"> c/IVA</span>' : ''}
      </div>
      <div class="product-card__footer">
        <div class="product-card__qty-ctrl">
          <button class="qty-btn qty-btn--minus" aria-label="Quitar uno">−</button>
          <span class="qty-count">1</span>
          <button class="qty-btn qty-btn--plus" aria-label="Agregar uno">+</button>
        </div>
        <button class="product-card__add-btn" aria-label="Agregar al carrito">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar
        </button>
      </div>
    </div>
  `

  const qtyCtrl  = card.querySelector('.product-card__qty-ctrl')
  const addBtn   = card.querySelector('.product-card__add-btn')
  const qtyCount = card.querySelector('.qty-count')

  function refresh() {
    const qty = getQty(product.id)
    qtyCtrl.hidden = qty === 0
    addBtn.hidden  = qty > 0
    if (qty > 0) qtyCount.textContent = qty
  }

  addBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    addItem(product)
  })

  card.querySelector('.qty-btn--plus').addEventListener('click', (e) => {
    e.stopPropagation()
    addItem(product)
  })

  card.querySelector('.qty-btn--minus').addEventListener('click', (e) => {
    e.stopPropagation()
    decrement(product.id)
  })

  card.addEventListener('click', () => onDetail && onDetail(product))

  subscribe(refresh)
  refresh()

  return card
}
