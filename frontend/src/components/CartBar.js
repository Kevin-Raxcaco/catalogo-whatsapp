import { getCart, getCount, subscribe } from '../services/cart.js'

export class CartBar {
  constructor(onOpen) {
    this._el = this._build(onOpen)
    document.body.appendChild(this._el)
    subscribe(() => this._refresh())
    this._refresh()
  }

  _build(onOpen) {
    const el = document.createElement('div')
    el.className = 'cart-bar'
    el.innerHTML = `
      <div class="cart-bar__inner">
        <div class="cart-bar__info">
          <span class="cart-bar__bubble" id="cb-count">0</span>
          <span class="cart-bar__label">productos en tu carrito</span>
        </div>
        <button class="cart-bar__cta" id="cb-cta">
          Ver pedido
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    `
    el.querySelector('#cb-cta').addEventListener('click', onOpen)
    return el
  }

  _refresh() {
    const count = getCount()
    this._el.classList.toggle('cart-bar--visible', count > 0)
    this._el.querySelector('#cb-count').textContent = count
  }

  destroy() {
    this._el.remove()
  }
}
