describe('add + remove', function () {
  it('should properly add records.', function () {
    let Model = decal.Model.extend({
      modelKey: 'test',
      idx: decal.attr()
    })

    let instances = []

    for (let i = 0; i < 10; i++) instances.push(Model.create({idx: i}))

    let store = decal.Store.create()
    store.add('test', instances)
    expect(store.__store.tests.toArray()).to.deep.equal(instances)
  })

  it('should properly remove records.', function () {
    let Model = decal.Model.extend({
      modelKey: 'test',
      idx: decal.attr()
    })

    let instances = []

    for (let i = 0; i < 10; i++) instances.push(Model.create({idx: i}))

    let store = decal.Store.create()
    store.add('test', instances)

    expect(store.__store.tests.toArray()).to.deep.equal(instances)

    store.remove('test', instances.splice(0, 5))
    expect(store.__store.tests.length).to.equal(5)

    store.remove('test', instances)
    expect(store.__store.tests.toArray()).to.not.deep.equal(instances)
  })
})
