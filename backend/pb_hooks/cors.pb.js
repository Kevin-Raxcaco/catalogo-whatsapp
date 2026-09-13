routerAdd("OPTIONS", "/*path", (e) => {
  e.response.header().set("Access-Control-Allow-Origin", "*")
  e.response.header().set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
  e.response.header().set("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning")
  return e.json(204, {})
})
