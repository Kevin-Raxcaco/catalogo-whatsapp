// PocketBase migration — colección products
migrate((db) => {
  const collection = new Collection({
    name:       'products',
    type:       'base',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    listRule:   '',   // públicos
    viewRule:   '',
    schema: [
      { name: 'catalog', type: 'relation', required: true,
        options: { collectionId: 'catalogs', cascadeDelete: true } },
      { name: 'name',    type: 'text',   required: true },
      { name: 'sku',     type: 'text'   },
      { name: 'price',   type: 'text'   },
      { name: 'image',   type: 'url'    },
      { name: 'order',   type: 'number', options: { min: 0 } },
      { name: 'fields',  type: 'json'   }, // campos extra configurados por el admin
      { name: 'tags',    type: 'json'   }, // [{label, bg, color}]
    ],
  })
  return db.save(collection)
},
(db) => db.deleteCollection('products'))
