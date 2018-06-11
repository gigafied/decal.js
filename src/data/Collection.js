'use strict'

const get = require('../utils/get')
const set = require('../utils/set')
const DecalArray = require('../core/Array')

module.exports = class Collection extends DecalArray {

  get modelClass () {
    return this._modelClass
  }

  set modelClass (val) {
    this._modelClass = val
    if (val) {
      set(this, 'modelKey', val.modelKey)
      set(this, 'collectionKey', val.collectionKey)
    }
  }

  get isDirty () {
    if (this._isDirty) return true
    for (let i = 0; i < this.length; i++) if (this[i].isDirty) return true
    return false
  }

  constructor (...args) {
    super(...args)
    this.__recordsByPK = {}
  }

  findBy (key, val) {
    let isPK = key === 'pk'
    let record = isPK ? this.__recordsByPK[val] : null

    if (record) return record

    record = super.findBy(key, val)
    if (isPK && record) this.__recordsByPK[val] = record

    return record
  }

  push (...args) {
    this._isDirty = true
    for (let i = 0, l = args.length; i < l; i++) {
      let record = args[i]
      let pk = get(record, 'pk')
      super.push(record)
      if (pk) this.__recordsByPK[pk] = record
    }

    return this.length
  }

  remove (record) {
    this._isDirty = true
    if (record.pk) delete this.__recordsByPK[record.pk]
    return super.remove(record)
  }

  serialize (isEmbedded, filter, dirty) {
    let a = []
    let hasChanges = false

    this.forEach(item => {
      if (isEmbedded) a.push(dirty ? item.serializeDirty(filter) : item.serialize(filter))
      else a.push(item.get('pk'))
    })

    if (isEmbedded && dirty) {
      a.forEach(item => {
        if (Object.keys(item).length) { hasChanges = true }
      })
      if (!hasChanges) return
    }
    return a
  }

  revertAll (revertRelationships) {
    this.forEach(item => item.revert(revertRelationships))
  }

  undirty (recursive) {
    this._isDirty = false
    this.forEach(item => item.undirty(recursive))
  }

  destroy (destroyRecords) {
    if (destroyRecords) this.forEach(item => item.destroy(true))
    super.destroy()
  }
}
