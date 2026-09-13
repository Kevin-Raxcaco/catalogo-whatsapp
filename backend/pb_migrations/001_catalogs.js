migrate((db) => {
  const collection = new Collection({
    name:       'catalogs',
    type:       'base',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    listRule:   '',
    viewRule:   '',
    schema: [
      { name: 'name',         type: 'text',   required: true },
      { name: 'slug',         type: 'text',   required: true },
      { name: 'description',  type: 'text'  },
      { name: 'emoji',        type: 'text'  },
      { name: 'status',       type: 'select', options: { values: ['active', 'draft'] }, required: true },
      { name: 'field_config', type: 'json'  },
    ],
  })
  db.save(collection)
},
(db) => db.deleteCollection('catalogs'))
