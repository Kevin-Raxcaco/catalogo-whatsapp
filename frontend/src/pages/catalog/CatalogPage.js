import { getCatalogBySlug, incrementViews } from '../../services/catalogs.js'
import { getProducts }       from '../../services/products.js'
import { ProductCard }       from '../../components/ProductCard.js'
import { ProductModal }      from '../../components/ProductModal.js'
import { CartBar }           from '../../components/CartBar.js'
import { CartSheet }         from '../../components/CartSheet.js'
import { getCatalogSlug, getCustomerFromUrl } from '../../utils/url.js'
import { initCart, getCart, isAbandoned, markAbandonedNotified, clearStorage } from '../../services/cart.js'
import { notifyAbandonedCart } from '../../services/atom.js'

export async function CatalogPage(container) {
  const slug = getCatalogSlug()
  if (!slug) { container.innerHTML = '<p>Catálogo no encontrado.</p>'; return }

  let catalog, productList

  try {
    catalog     = await getCatalogBySlug(slug)
    productList = await getProducts(catalog.id)
  } catch {
    container.innerHTML = '<p style="padding:32px;text-align:center;color:#64748B;">Catálogo no encontrado.</p>'
    return
  }

  // Restaurar carrito de sesión anterior
  initCart(catalog.id, catalog.field_config?.abandoned_timeout_min)

  // Categorías únicas
  const categories = [...new Set(
    productList.map(p => p.category).filter(Boolean)
  )]
  const hasCategories = categories.length > 0
  let activeCategory  = 'all'

  container.innerHTML = `
    <div class="catalog-hero">
      <div class="catalog-hero__logo">${catalog.emoji ?? '🛍️'}</div>
      <div>
        <div class="catalog-hero__name">${catalog.name}</div>
        <div class="catalog-hero__desc">${catalog.description ?? 'Selecciona los productos que quieras y finaliza tu pedido por WhatsApp'}</div>
        <div class="catalog-hero__wa-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Pedido por WhatsApp
        </div>
      </div>
      <div class="catalog-hero__meta" style="margin-left:auto;text-align:right;">
        <div style="font-size:13px;color:var(--color-text-muted);">${productList.length} productos</div>
      </div>
    </div>

    ${hasCategories ? `
    <div class="category-tabs" id="category-tabs">
      <button class="category-tab category-tab--active" data-cat="all">Todos</button>
      ${categories.map(c => `<button class="category-tab" data-cat="${c}">${c}</button>`).join('')}
    </div>` : ''}

    <div class="grid auto-fill-220 gap-16" id="products-grid" style="padding-bottom:100px;"></div>
  `

  const currency = catalog.field_config?.currency ?? null
  const modal    = new ProductModal(currency)
  const grid     = container.querySelector('#products-grid')

  function renderGrid(cat) {
    const filtered = cat === 'all' ? productList : productList.filter(p => p.category === cat)
    grid.innerHTML = ''
    filtered.forEach(p => grid.appendChild(ProductCard(p, (product) => modal.open(product), currency)))
  }

  renderGrid('all')

  // Category tabs
  if (hasCategories) {
    container.querySelector('#category-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.category-tab')
      if (!btn) return
      container.querySelectorAll('.category-tab').forEach(b => b.classList.remove('category-tab--active'))
      btn.classList.add('category-tab--active')
      activeCategory = btn.dataset.cat
      renderGrid(activeCategory)
    })
  }

  const sheet   = new CartSheet(catalog, () => { clearStorage() })
  const cartBar = new CartBar(() => sheet.open())

  incrementViews(catalog.id)

  // Abandoned cart — solo si tenemos datos del cliente por URL
  const { name, phone } = getCustomerFromUrl()
  if (name && phone) {
    const abandonedTimer = setInterval(() => {
      if (isAbandoned()) {
        const items = getCart()
        if (items.length) {
          notifyAbandonedCart(name, phone.replace(/^\+/, ''), items, catalog)
          markAbandonedNotified()
        }
        clearInterval(abandonedTimer)
      }
    }, 60_000) // verifica cada minuto
  }
}
