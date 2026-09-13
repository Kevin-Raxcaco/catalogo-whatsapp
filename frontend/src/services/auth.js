import pb from './pb.js'

export function isLoggedIn() {
  return pb.authStore.isValid
}

export function getCurrentUser() {
  return pb.authStore.model
}

export async function login(email, password) {
  return await pb.collection('users').authWithPassword(email, password)
}

export function logout() {
  pb.authStore.clear()
  window.location.href = '/admin/login'
}

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/admin/login'
  }
}
