const Adapter = require('../../../src/data/Adapter')
let ID = 1

module.exports = class MockAdapter extends Adapter {

  fetch () {
    return null
  }

  fetchAll () {
    return []
  }

  createRecord (record) {
    record.pk = ID++
    return new Promise((resolve, reject) => setTimeout(() => resolve(record)), 500)
  }

  updateRecord (record) {
    return new Promise((resolve, reject) => setTimeout(() => resolve(record)), 500)
  }

  deleteRecord (record) {
    return new Promise((resolve, reject) => setTimeout(() => resolve(record)), 500)
  }
}
