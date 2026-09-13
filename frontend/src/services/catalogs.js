import pb from './pb.js'

export async function getCatalogs() {
  return await pb.collection('catalogs').getFullList()
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
