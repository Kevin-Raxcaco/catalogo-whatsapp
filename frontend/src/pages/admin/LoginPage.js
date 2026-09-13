import { login, isLoggedIn } from '../../services/auth.js'

export function LoginPage(container) {
  if (isLoggedIn()) { window.location.href = '/admin'; return }

  container.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:var(--grad-soft);padding:24px;">
      <div class="card" style="width:100%;max-width:400px;padding:40px 36px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;
            width:52px;height:52px;border-radius:16px;
            background:var(--grad-main);color:#fff;font-size:24px;margin-bottom:16px;">⚡</div>
          <h2 style="margin-bottom:4px;">Atom Catálogos</h2>
          <p style="font-size:14px;color:var(--color-text-muted);">Panel de administración</p>
        </div>

        <form id="login-form" style="display:flex;flex-direction:column;gap:16px;">
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Email</label>
            <input id="email" type="email" class="field" placeholder="admin@atomchat.io"
              autocomplete="email" required style="width:100%;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Contraseña</label>
            <input id="password" type="password" class="field" placeholder="••••••••"
              autocomplete="current-password" required style="width:100%;box-sizing:border-box;">
          </div>

          <div id="login-error" style="display:none;padding:10px 14px;border-radius:10px;
            background:rgba(255,70,70,0.08);color:#d32f2f;font-size:13px;text-align:center;"></div>

          <button type="submit" class="btn btn--primary" id="btn-login"
            style="width:100%;justify-content:center;margin-top:4px;">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  `

  const form     = container.querySelector('#login-form')
  const btnLogin = container.querySelector('#btn-login')
  const errBox   = container.querySelector('#login-error')

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    errBox.style.display = 'none'
    btnLogin.disabled = true
    btnLogin.textContent = 'Entrando…'

    const email    = container.querySelector('#email').value.trim()
    const password = container.querySelector('#password').value

    try {
      await login(email, password)
      window.location.href = '/admin'
    } catch {
      errBox.textContent = 'Email o contraseña incorrectos.'
      errBox.style.display = 'block'
      btnLogin.disabled = false
      btnLogin.textContent = 'Iniciar sesión'
    }
  })
}
