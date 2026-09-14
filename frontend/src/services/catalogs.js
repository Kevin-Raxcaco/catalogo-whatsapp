import pb from './pb.js'

export async function getCatalogs() {
  const catalogs = await pb.collection('catalogs').getFullList()
  const counts = await Promise.all(
    catalogs.map(c =>
      pb.collection('products')
        .getList(1, 1, { filter: `catalog="${c.id}"` })
        .then(r => r.totalItems)
        .catch(() => 0)
    )
  )
  return catalogs.map((c, i) => ({ ...c, product_count: counts[i] }))
}

export async function getCatalogBySlug(slug) {
  return await pb.collection('catalogs').getFirstListItem(`slug="${slug}"`)
}

export async function createCatalog(data) {
  return await pb.collection('catalogs').create(data)
}

export async function updateCatalog(id, data) {
  return await pb.collection('catalogs').update(id, data)
}

export async function deleteCatalog(id) {
  return await pb.collection('catalogs').delete(id)
}

export async function incrementViews(id) {
  try {
    const cat = await pb.collection('catalogs').getOne(id, { fields: 'id,views' })
    await pb.collection('catalogs').update(id, { views: (cat.views ?? 0) + 1 })
  } catch { /* silently fail if field doesn't exist or no permission */ }
}

export async function incrementWaClicks(id) {
  try {
    const cat = await pb.collection('catalogs').getOne(id, { fields: 'id,wa_clicks' })
    await pb.collection('catalogs').update(id, { wa_clicks: (cat.wa_clicks ?? 0) + 1 })
  } catch { /* silently fail */ }
}
