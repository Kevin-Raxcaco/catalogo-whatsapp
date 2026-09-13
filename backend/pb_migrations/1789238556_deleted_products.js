/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4092854851");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
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
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text1579384326",
        "max": 0,
        "min": 0,
        "name": "name",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text261109956",
        "max": 0,
        "min": 0,
        "name": "sku",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3402113753",
        "max": 0,
        "min": 0,
        "name": "price",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "exceptDomains": null,
        "help": "",
        "hidden": false,
        "id": "url3309110367",
        "name": "image",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "url"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number4113142680",
        "max": null,
        "min": null,
        "name": "order",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json2128995208",
        "maxSize": 0,
        "name": "fields",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "help": "",
        "hidden": false,
        "id": "json1874629670",
        "maxSize": 0,
        "name": "tags",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      }
    ],
    "id": "pbc_4092854851",
    "indexes": [],
    "listRule": "",
    "name": "products",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": ""
  });

  return app.save(collection);
})
