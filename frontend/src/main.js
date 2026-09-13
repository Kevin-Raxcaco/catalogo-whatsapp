import { isLoggedIn, logout } from './services/auth.js'

const app = document.getElementById('app')

async function route() {
  const path = window.location.pathname

  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      const { LoginPage } = await import('./pages/admin/LoginPage.js')
      LoginPage(app)
      return
    }
    if (!isLoggedIn()) { window.location.href = '/admin/login'; return }

    app.innerHTML = buildAdminShell()

    const btnLogout = document.getElementById('btn-logout')
    if (btnLogout) btnLogout.addEventListener('click', logout)

    if (path === '/admin' || path === '/admin/catalogs') {
      const { CatalogsPage } = await import('./pages/admin/CatalogsPage.js')
      CatalogsPage(document.getElementById('admin-content'))
    } else if (path.match(/\/admin\/catalogs\/([\w-]+)/)) {
      const { CatalogDetailPage } = await import('./pages/admin/CatalogDetailPage.js')
      CatalogDetailPage(document.getElementById('admin-content'))
    }
    return
  }

  if (path === '/catalog' || path.startsWith('/catalog/')) {
    const { CatalogPage } = await import('./pages/catalog/CatalogPage.js')
    app.innerHTML = buildPublicShell()
    CatalogPage(document.getElementById('catalog-content'))
    return
  }

  // Root → redirect
  window.location.href = isLoggedIn() ? '/admin' : '/catalog'
}

function buildAdminShell() {
  return `
    <nav class="navbar">
      <div class="navbar__logo">
        <div class="navbar__logo-mark">⚡</div>
        <span class="navbar__logo-name">Atom Catálogos</span>
      </div>
      <div style="margin-left:auto;display:flex;align-items:center;gap:12px;">
        <a class="btn btn--ghost btn--sm" href="/admin">Catálogos</a>
        <button class="btn btn--ghost btn--sm" id="btn-logout">Salir</button>
        <div class="navbar__avatar">MA</div>
      </div>
    </nav>
    <div class="page" id="admin-content"></div>
  `
}

function buildPublicShell() {
  return `<div class="page" id="catalog-content"></div>`
}

route()
window.addEventListener('popstate', route)
