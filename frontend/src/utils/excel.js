import * as XLSX from 'xlsx'

/**
 * Reads a File (from <input type="file">) and returns an array of row objects.
 * @param {File} file
 * @returns {Promise<object[]>}
 */
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        resolve(XLSX.utils.sheet_to_json(ws, { defval: '' }))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Returns the column names (headers) of a parsed file.
 * @param {object[]} rows
 * @returns {string[]}
 */
export function getColumns(rows) {
  if (!rows.length) return []
  return Object.keys(rows[0])
}

/**
 * Applies a column mapping config to raw rows.
 * config: { name: 'col_a', image: 'col_b', price: 'col_c', extra: [{key, col}] }
 * @param {object[]} rows
 * @param {object}   config
 * @returns {object[]}
 */
export function applyMapping(rows, config) {
  return rows.map((row) => {
    const mapped = {
      name:  row[config.name]  ?? '',
      image: row[config.image] ?? '',
      price: row[config.price] ?? '',
      sku:   row[config.sku]   ?? '',
    }
    for (const { key, col } of config.extra ?? []) {
      mapped[key] = row[col] ?? ''
    }
    return mapped
  })
}
