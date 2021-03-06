
const MockAdapter = require('../../mocks/MockAdapter')

describe('save', function () {
  let store
  let Model
  let mockAdapter

  beforeEach(function () {
    Model = decal.Model.extend({
      modelKey: 'saveTest',
      primaryKey: 'id',
      a: decal.attr({defaultValue: 'a'}),
      b: decal.attr({defaultValue: 'b'}),
      c: decal.attr({defaultValue: 'c'})
    })
    store = decal.Store.create()
    mockAdapter = MockAdapter.create()
    store.addModel(Model, mockAdapter)
  })

  afterEach(function () {
    store.destroy(true)
  })

  it('should fire a \'new\' event on new records and a \'save\' event on updates.', function (done) {
    let instance = Model.create()
    instance.once('new', () => {
      instance.once('save', () => done())
      instance.a = 'A'
      instance.save()
    })
    instance.save()
  })

  it('should fire save events after new and keep track of all changes', function (done) {
    let instance = Model.create()
    let newCount = 0
    let saveCount = 0
    let eventUpdates = {}
    instance.on('new', () => newCount++)
    instance.on('save', updates => {
      Object.assign(eventUpdates, updates)
      saveCount++
    })
    instance.a = 'A'
    instance.save()
    instance.b = 'B'
    instance.save()
    instance.c = 'C'
    instance.save().then(() => {
      expect(newCount).to.equal(1)
      expect(saveCount).to.equal(2)
      expect(eventUpdates).to.deep.equal({b: 'B', c: 'C'})
      done()
    })
  })

  it('should fire multiple save events without losing track of changes', function (done) {
    let instance = Model.create()
    let count = 0
    let eventUpdates = {}
    instance.save().then(() => {
      instance.on('save', updates => {
        Object.assign(eventUpdates, updates)
        count++
      })
      instance.a = 'aa'
      instance.save()
      instance.b = 'B'
      instance.save()
      instance.a = 'A'
      instance.c = 'C'
      instance.save().then(() => {
        expect(eventUpdates).to.deep.equal({a: 'A', b: 'B', c: 'C'})
        expect(count).to.equal(3)
        done()
      })
    })
  })
})
