import pb from './pb.js'

export async function logAtomRequest({ catalogId, type, customerName, customerPhone, atomField, itemsCount, itemsDetail, status, errorMsg }) {
  try {
    await pb.collection('atom_logs').create({
      catalog:        catalogId,
      type,
      customer_name:  customerName  ?? '',
      customer_phone: customerPhone ?? '',
      atom_field:     atomField     ?? '',
      items_count:    itemsCount    ?? 0,
      items_detail:   itemsDetail   ? JSON.stringify(itemsDetail) : '',
      status,
      error_msg:      errorMsg      ?? '',
    }, { requestKey: null })
  } catch {
    // Los logs nunca bloquean el flujo principal
  }
}

export async function getAtomLogs(catalogId, page = 1, perPage = 50) {
  return pb.collection('atom_logs').getList(page, perPage, {
    filter:  `catalog="${catalogId}"`,
    sort:    '-created',
  })
}
