/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3018026771",
    "help": "",
    "hidden": false,
    "id": "relation455881287",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "catalog",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851")

  // remove field
  collection.fields.removeById("relation455881287")

  return app.save(collection)
})
