import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_PB_URL ?? '/')

// Skip ngrok browser warning interstitial when using ngrok tunnel
if (import.meta.env.VITE_PB_URL?.includes('ngrok')) {
  pb.beforeSend = (url, options) => {
    options.headers = { ...options.headers, 'ngrok-skip-browser-warning': 'true' }
    return { url, options }
  }
}

export default pb
