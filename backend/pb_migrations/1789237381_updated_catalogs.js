/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3018026771")

  // remove field
  collection.fields.removeById("select2063623452")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3018026771")

  // add field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "draft, active"
    ]
  }))

  return app.save(collection)
})
