import { addItem } from '../services/cart.js'

const HIDDEN_FIELDS = new Set(['id', 'collectionId', 'collectionName', 'created', 'updated', 'catalog', 'order', 'name', 'price', 'image', 'sku', 'extras', '_bg', '_emoji'])

/**
 * ProductModal — bottom sheet con detalle del producto.
 * Singleton: se monta una vez en el DOM y se rellena al abrir.
 */
export class ProductModal {
  constructor() {
    this._el = this._build()
    document.body.appendChild(this._el)
    this._el.addEventListener('click', (e) => {
      if (e.target === this._el) this.close()
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close()
    })
  }

  _build() {
    const el = document.createElement('div')
    el.className = 'modal-overlay'
    el.innerHTML = `
      <div class="modal">
        <div class="modal__handle"></div>
        <button class="modal__close" id="pm-close" aria-label="Cerrar">✕</button>
        <div class="modal__image" id="pm-img"></div>
        <div class="modal__body">
          <div class="modal__name"  id="pm-name"></div>
          <div class="modal__price" id="pm-price"></div>
          <div class="modal__sku"   id="pm-sku"></div>
          <div class="modal__fields" id="pm-fields"></div>
          <div class="modal__divider"></div>
          <button class="btn btn--primary" id="pm-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar al carrito
          </button>
        </div>
      </div>
    `
    el.querySelector('#pm-close').addEventListener('click', () => this.close())
    return el
  }

  open(product) {
    this._product = product

    const imgEl = this._el.querySelector('#pm-img')
    if (product.image) {
      imgEl.innerHTML = `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`
      imgEl.style.background = ''
    } else {
      imgEl.innerHTML = product._emoji ?? '📦'
      imgEl.style.background = product._bg ?? '#F5F3FF'
    }

    this._el.querySelector('#pm-name').textContent  = product.name
    this._el.querySelector('#pm-price').textContent = product.price
      ? `${product.price} c/IVA` : ''
    this._el.querySelector('#pm-sku').textContent   = product.sku
      ? `SKU: ${product.sku}` : ''

    const extras = product.extras && typeof product.extras === 'object' ? product.extras : {}
    const extraFields = Object.entries(extras).filter(([, val]) => val !== null && val !== undefined && val !== '')
    this._el.querySelector('#pm-fields').innerHTML = extraFields
      .map(([key, val]) => `
        <div class="modal__field">
          <span class="modal__field-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
          <span>${val}</span>
        </div>`)
      .join('')

    this._el.querySelector('#pm-cta').onclick = () => {
      addItem(product)
      this.close()
    }

    this._el.classList.add('modal-overlay--open')
    document.body.style.overflow = 'hidden'
  }

  close() {
    this._el.classList.remove('modal-overlay--open')
    document.body.style.overflow = ''
  }
}
