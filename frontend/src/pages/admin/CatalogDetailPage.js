import { getCatalogById, updateCatalog, deleteCatalog } from '../../services/catalogs.js'
import { getProducts, upsertProducts } from '../../services/products.js'
import { requireAuth } from '../../services/auth.js'
import { ColumnMapper } from '../../components/ColumnMapper.js'
import { parseFile, getColumns, applyMapping } from '../../utils/excel.js'

export async function CatalogDetailPage(container) {
  requireAuth()

  const catalogId = window.location.pathname.split('/').pop()
  const isNew = catalogId === 'new'

  if (isNew) {
    renderNewCatalogForm(container)
    return
  }

  let catalog, products
  try {
    const [cat, prods] = await Promise.all([
      getCatalogById(catalogId),
      getProducts(catalogId),
    ])
    catalog  = cat
    products = prods
    if (!catalog) throw new Error('not found')
  } catch {
    container.innerHTML = `<p style="color:var(--color-text-muted);padding:40px;">Catálogo no encontrado.</p>`
    return
  }

  renderDetail(container, catalog, products)
}

// ─── New catalog form ────────────────────────────────────────────────────────

function renderNewCatalogForm(container) {
  container.innerHTML = `
    <div style="max-width:520px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px;">
        <button class="btn btn--ghost btn--sm" id="btn-back">← Volver</button>
        <h2 style="margin:0;">Nuevo catálogo</h2>
      </div>
      <form id="new-catalog-form" class="card" style="padding:28px;display:flex;flex-direction:column;gap:18px;">
        <div>
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Nombre *</label>
          <input id="nc-name" class="field" placeholder="Ej: Calzado temporada" required
            style="width:100%;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Slug (URL)</label>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:13px;color:var(--color-text-muted);">/catalog/</span>
            <input id="nc-slug" class="field" placeholder="calzado-temporada"
              style="flex:1;box-sizing:border-box;">
          </div>
        </div>
        <div>
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Descripción</label>
          <input id="nc-desc" class="field" placeholder="Breve descripción para el cliente"
            style="width:100%;box-sizing:border-box;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Emoji</label>
            <input id="nc-emoji" class="field" placeholder="🛍️" maxlength="4"
              style="width:100%;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Estado</label>
            <select id="nc-status" class="field" style="width:100%;box-sizing:border-box;">
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
            </select>
          </div>
        </div>
        <div id="nc-error" style="display:none;padding:10px 14px;border-radius:10px;
          background:rgba(255,70,70,0.08);color:#d32f2f;font-size:13px;"></div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button type="button" class="btn btn--ghost" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn--primary" id="btn-create">Crear catálogo</button>
        </div>
      </form>
    </div>
  `

  const nameInput  = container.querySelector('#nc-name')
  const slugInput  = container.querySelector('#nc-slug')
  const errBox     = container.querySelector('#nc-error')

  nameInput.addEventListener('input', () => {
    slugInput.value = nameInput.value.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  })

  container.querySelector('#btn-back').addEventListener('click', () => history.back())
  container.querySelector('#btn-cancel').addEventListener('click', () => history.back())

  container.querySelector('#new-catalog-form').addEventListener('submit', async (ev) => {
    ev.preventDefault()
    errBox.style.display = 'none'
    const btn = container.querySelector('#btn-create')
    btn.disabled = true
    btn.textContent = 'Creando…'

    try {
      const { createCatalog } = await import('../../services/catalogs.js')
      const cat = await createCatalog({
        name:        container.querySelector('#nc-name').value.trim(),
        slug:        container.querySelector('#nc-slug').value.trim(),
        description: container.querySelector('#nc-desc').value.trim(),
        emoji:       container.querySelector('#nc-emoji').value.trim() || '🛍️',
        status:      container.querySelector('#nc-status').value,
        field_config: {},
      })
      window.location.href = `/admin/catalogs/${cat.id}`
    } catch (err) {
      errBox.textContent = err?.data?.message ?? 'Error al crear el catálogo.'
      errBox.style.display = 'block'
      btn.disabled = false
      btn.textContent = 'Crear catálogo'
    }
  })
}

// ─── Existing catalog detail ─────────────────────────────────────────────────

function renderDetail(container, catalog, products) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
      <button class="btn btn--ghost btn--sm" id="btn-back">← Catálogos</button>
      <div style="display:flex;align-items:center;gap:10px;flex:1;">
        <span style="font-size:28px;">${catalog.emoji ?? '🛍️'}</span>
        <div>
          <h2 style="margin:0 0 2px;">${catalog.name}</h2>
          <span style="font-size:12px;color:var(--color-text-muted);">/catalog/${catalog.slug}</span>
        </div>
        <span class="badge ${catalog.status === 'active' ? 'badge--active' : 'badge--draft'}" style="margin-left:8px;">
          ${catalog.status === 'active' ? 'Activo' : 'Borrador'}
        </span>
      </div>
      <div style="display:flex;gap:8px;">
        <a class="btn btn--ghost btn--sm" href="/catalog/${catalog.slug}" target="_blank">Ver →</a>
        <button class="btn btn--primary btn--sm" id="btn-toggle-status">
          ${catalog.status === 'active' ? 'Pausar' : 'Activar'}
        </button>
      </div>
    </div>

    <div class="detail-tabs" style="margin-bottom:24px;">
      <button class="detail-tabs__tab active" data-tab="products">
        Productos <span class="badge" style="background:var(--color-bg-subtle);color:var(--color-text);">${products.length}</span>
      </button>
      <button class="detail-tabs__tab" data-tab="upload">Subir archivo</button>
      <button class="detail-tabs__tab" data-tab="settings">Configuración</button>
    </div>

    <div id="tab-products"></div>
    <div id="tab-upload"   style="display:none;"></div>
    <div id="tab-settings" style="display:none;"></div>
  `

  container.querySelector('#btn-back').addEventListener('click', () => {
    window.location.href = '/admin'
  })

  container.querySelector('#btn-toggle-status').addEventListener('click', async (e) => {
    const newStatus = catalog.status === 'active' ? 'draft' : 'active'
    e.target.disabled = true
    try {
      await updateCatalog(catalog.id, { status: newStatus })
      catalog.status = newStatus
      e.target.textContent = newStatus === 'active' ? 'Pausar' : 'Activar'
      container.querySelector('.badge.badge--active, .badge.badge--draft').className =
        `badge ${newStatus === 'active' ? 'badge--active' : 'badge--draft'}`
      container.querySelector('.badge.badge--active, .badge.badge--draft').textContent =
        newStatus === 'active' ? 'Activo' : 'Borrador'
    } catch { /* ignore */ }
    e.target.disabled = false
  })

  const tabs = container.querySelectorAll('.detail-tabs__tab')
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'))
    tab.classList.add('active')
    container.querySelectorAll('[id^="tab-"]').forEach(p => p.style.display = 'none')
    container.querySelector(`#tab-${tab.dataset.tab}`).style.display = ''
  }))

  renderProductsTab(container.querySelector('#tab-products'), products)
  renderUploadTab(container.querySelector('#tab-upload'), catalog, (newProducts) => {
    products = newProducts
    renderProductsTab(container.querySelector('#tab-products'), products)
    container.querySelector('.detail-tabs__tab[data-tab="products"] .badge').textContent = products.length
  })
  renderSettingsTab(container.querySelector('#tab-settings'), catalog)
}

// ─── Tab: Products ───────────────────────────────────────────────────────────

function renderProductsTab(el, products) {
  if (!products.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:40px;margin-bottom:12px;">📦</div>
        <p style="color:var(--color-text-muted);font-size:14px;">Sin productos aún. Sube un archivo en la pestaña <strong>Subir archivo</strong>.</p>
      </div>`
    return
  }

  const fieldConfig = {}
  el.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>SKU</th>
            <th>Precio</th>
            <th>Imagen</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td style="font-weight:600;">${p.name}</td>
              <td style="color:var(--color-text-muted);font-size:13px;">${p.sku || '—'}</td>
              <td>${p.price || '—'}</td>
              <td>
                ${p.image
                  ? `<img src="${p.image}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">`
                  : '<span style="color:var(--color-text-light);font-size:12px;">sin imagen</span>'
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

// ─── Tab: Upload ─────────────────────────────────────────────────────────────

function renderUploadTab(el, catalog, onImported) {
  el.innerHTML = `
    <div style="max-width:640px;">
      <div class="drop-zone" id="drop-zone">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
        </svg>
        <p style="font-size:14px;font-weight:600;color:var(--color-text);">Arrastra tu archivo aquí</p>
        <p style="font-size:13px;color:var(--color-text-muted);">Excel (.xlsx) o CSV — máx. 5 MB</p>
        <input type="file" id="file-input" accept=".xlsx,.xls,.csv"
          style="display:none;">
        <button type="button" class="btn btn--ghost btn--sm" id="btn-browse">Seleccionar archivo</button>
      </div>
      <div id="mapper-area" style="display:none;margin-top:24px;"></div>
    </div>
  `

  const dropZone  = el.querySelector('#drop-zone')
  const fileInput = el.querySelector('#file-input')
  const mapArea   = el.querySelector('#mapper-area')

  el.querySelector('#btn-browse').addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0])
  })
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover') })
  dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('dragover'))
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault()
    dropZone.classList.remove('dragover')
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  })

  async function handleFile(file) {
    mapArea.innerHTML = `<p style="font-size:13px;color:var(--color-text-muted);">Leyendo archivo…</p>`
    mapArea.style.display = ''
    let rows
    try {
      rows = await parseFile(file)
    } catch {
      mapArea.innerHTML = `<p style="color:#d32f2f;font-size:13px;">No se pudo leer el archivo. Verifica el formato.</p>`
      return
    }
    if (!rows.length) {
      mapArea.innerHTML = `<p style="color:#d32f2f;font-size:13px;">El archivo está vacío.</p>`
      return
    }
    const columns = getColumns(rows)
    mapArea.innerHTML = `<p style="font-size:13px;margin-bottom:16px;font-weight:600;">
      ${rows.length} filas encontradas · Configura el mapeo de columnas</p>`

    const savedMapping = catalog.field_config?.mapping ?? {}

    const mapper = new ColumnMapper({
      columns,
      initial: savedMapping,
      onSave: async ({ mapping }) => {
        btn.disabled = true
        btn.textContent = 'Importando…'
        try {
          const mapped = applyMapping(rows, mapping)
          const saved  = await upsertProducts(catalog.id, mapped)
          await updateCatalog(catalog.id, {
            field_config: { ...catalog.field_config, mapping },
          })
          catalog.field_config = { ...catalog.field_config, mapping }
          onImported(saved)
          mapArea.innerHTML = `
            <div style="padding:20px;background:rgba(6,223,115,0.08);border-radius:12px;text-align:center;">
              <p style="font-weight:700;color:#0c7c47;">✓ ${saved.length} productos importados correctamente</p>
            </div>`
        } catch (err) {
          btn.textContent = 'Importar'
          btn.disabled = false
          mapArea.querySelector('#import-error').textContent = 'Error al importar: ' + (err?.message ?? '')
        }
      },
    })
    mapArea.appendChild(mapper.el)

    const btn = document.createElement('button')
    btn.className = 'btn btn--primary'
    btn.style.marginTop = '16px'
    btn.textContent = 'Importar productos'
    const errEl = document.createElement('p')
    errEl.id = 'import-error'
    errEl.style.cssText = 'color:#d32f2f;font-size:13px;margin-top:8px;'

    btn.addEventListener('click', () => mapper.triggerSave())
    mapArea.appendChild(btn)
    mapArea.appendChild(errEl)
  }
}

// ─── Tab: Settings ───────────────────────────────────────────────────────────

function renderSettingsTab(el, catalog) {
  el.innerHTML = `
    <div style="max-width:480px;">
      <form id="settings-form" class="card" style="padding:24px;display:flex;flex-direction:column;gap:16px;">
        <div>
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Nombre</label>
          <input id="s-name" class="field" value="${escHtml(catalog.name)}" style="width:100%;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Descripción</label>
          <input id="s-desc" class="field" value="${escHtml(catalog.description ?? '')}"
            style="width:100%;box-sizing:border-box;">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Emoji</label>
            <input id="s-emoji" class="field" value="${escHtml(catalog.emoji ?? '')}" maxlength="4"
              style="width:100%;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Estado</label>
            <select id="s-status" class="field" style="width:100%;box-sizing:border-box;">
              <option value="draft"   ${catalog.status !== 'active' ? 'selected' : ''}>Borrador</option>
              <option value="active"  ${catalog.status === 'active' ? 'selected' : ''}>Activo</option>
            </select>
          </div>
        </div>
        <div id="s-msg" style="display:none;padding:10px;border-radius:10px;font-size:13px;"></div>
        <div style="display:flex;gap:10px;justify-content:space-between;">
          <button type="button" class="btn btn--ghost btn--sm" id="btn-delete"
            style="color:#d32f2f;border-color:rgba(211,47,47,0.3);">
            Eliminar catálogo
          </button>
          <button type="submit" class="btn btn--primary" id="btn-save">Guardar cambios</button>
        </div>
      </form>
    </div>
  `

  const msg = el.querySelector('#s-msg')

  el.querySelector('#settings-form').addEventListener('submit', async (ev) => {
    ev.preventDefault()
    const btn = el.querySelector('#btn-save')
    btn.disabled = true
    btn.textContent = 'Guardando…'
    msg.style.display = 'none'
    try {
      await updateCatalog(catalog.id, {
        name:        el.querySelector('#s-name').value.trim(),
        description: el.querySelector('#s-desc').value.trim(),
        emoji:       el.querySelector('#s-emoji').value.trim(),
        status:      el.querySelector('#s-status').value,
      })
      msg.style.cssText += ';background:rgba(6,223,115,0.1);color:#0c7c47;display:block;'
      msg.textContent = '✓ Cambios guardados'
    } catch {
      msg.style.cssText += ';background:rgba(255,70,70,0.08);color:#d32f2f;display:block;'
      msg.textContent = 'Error al guardar. Intenta de nuevo.'
    }
    btn.disabled = false
    btn.textContent = 'Guardar cambios'
  })

  el.querySelector('#btn-delete').addEventListener('click', async () => {
    if (!confirm(`¿Eliminar el catálogo "${catalog.name}" y todos sus productos? Esta acción no se puede deshacer.`)) return
    try {
      await deleteCatalog(catalog.id)
      window.location.href = '/admin'
    } catch {
      msg.textContent = 'Error al eliminar el catálogo.'
      msg.style.cssText += ';background:rgba(255,70,70,0.08);color:#d32f2f;display:block;'
    }
  })
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
