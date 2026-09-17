const FIELDS = [
  { key: 'name',        label: 'Nombre del producto', required: true  },
  { key: 'description', label: 'Descripción',          required: false },
  { key: 'category',    label: 'Categoría',            required: false },
  { key: 'price',       label: 'Precio',               required: false },
  { key: 'sku',         label: 'SKU / Código',         required: false },
  { key: 'image',       label: 'Imagen (URL)',          required: false },
]

export class ColumnMapper {
  /**
   * @param {object}   opts
   * @param {string[]} opts.columns  - Columnas detectadas en el archivo
   * @param {object}   opts.initial  - Mapeo previo guardado { name:'col_a', ... }
   * @param {function} opts.onSave   - Callback({ mapping, order })
   */
  constructor({ columns, initial = {}, onSave }) {
    this._onSave = onSave
    this.el = this._build(columns, initial)
  }

  _build(columns, initial) {
    const options = columns.map(c =>
      `<option value="${c}">${c}</option>`
    ).join('')

    const wrap = document.createElement('div')
    wrap.className = 'card'
    wrap.innerHTML = `
      <div class="grad-bar"></div>
      <h3 style="margin-bottom:6px;">Mapeo de columnas</h3>
      <p style="font-size:13.5px;color:var(--color-text-muted);margin-bottom:20px;">
        Asigna qué columna de tu archivo corresponde a cada campo del catálogo.
      </p>
      <div style="overflow-x:auto;">
        <table class="table">
          <thead>
            <tr>
              <th>Campo del catálogo</th>
              <th>Columna del archivo</th>
              <th>Orden en ficha</th>
            </tr>
          </thead>
          <tbody>
            ${FIELDS.map(f => `
              <tr>
                <td>
                  <strong>${f.label}</strong>
                  ${f.required ? '<span style="color:#EF4444;font-size:11px;"> *</span>' : ''}
                </td>
                <td>
                  <select class="field-select" data-field="${f.key}">
                    <option value="">— sin asignar —</option>
                    ${options}
                  </select>
                </td>
                <td>
                  ${!['name','image'].includes(f.key)
                    ? `<input type="number" class="field-number" data-order="${f.key}" value="" min="1">`
                    : '—'}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `

    // Pre-select saved values
    for (const [field, col] of Object.entries(initial)) {
      const sel = wrap.querySelector(`[data-field="${field}"]`)
      if (sel) sel.value = col
    }

    this._wrap = wrap
    return wrap
  }

  triggerSave() {
    const mapping = {}
    const order   = {}
    this._wrap.querySelectorAll('[data-field]').forEach(sel => {
      if (sel.value) mapping[sel.dataset.field] = sel.value
    })
    this._wrap.querySelectorAll('[data-order]').forEach(inp => {
      if (inp.value) order[inp.dataset.order] = Number(inp.value)
    })

    if (!mapping.name) {
      alert('El campo "Nombre del producto" es obligatorio.')
      return
    }

    this._onSave({ mapping, order })
  }
}
