/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    id:         "pbc_3018026771",
    name:       "catalogs",
    type:       "base",
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    listRule:   "",
    viewRule:   "",
  })
  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3018026771")
  return app.delete(collection)
})
