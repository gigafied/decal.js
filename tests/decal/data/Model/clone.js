describe('clone', function () {
  it('should properly clone records.', function () {
    let Model = decal.Model.extend({
      a: decal.attr(),
      b: decal.attr()
    })

    let json = [
      {a: '1', b: '2'},
      {a: '2', b: '3'}
    ]

    let instance1 = Model.create()
    let instance2 = Model.create()

    instance1.deserialize(json[0])
    instance2.deserialize(json[1])

    let instance3 = instance1.clone()
    let instance4 = instance2.clone()

    expect(instance1.a).to.equal('1')
    expect(instance1.b).to.equal('2')

    expect(instance2.a).to.equal('2')
    expect(instance2.b).to.equal('3')

    expect(instance3.a).to.equal('1')
    expect(instance3.b).to.equal('2')

    expect(instance4.a).to.equal('2')
    expect(instance4.b).to.equal('3')

    let deserialized = [
      instance3.getProperties(['a', 'b']),
      instance4.getProperties(['a', 'b'])
    ]

    expect(deserialized).to.deep.equal(json)

    instance1.destroy()
    instance2.destroy()
    instance3.destroy()
    instance4.destroy()
  })

  it('should not clone primary keys.', function () {
    let Model = decal.Model.extend({
      primaryKey: 'uuid'
    })

    let json = [
      {uuid: 1},
      {uuid: 2}
    ]

    let instance1 = Model.create()
    let instance2 = Model.create()

    instance1.deserialize(json[0])
    instance2.deserialize(json[1])

    let instance3 = instance1.clone()
    let instance4 = instance2.clone()

    expect(instance1.pk).to.equal(1)
    expect(instance2.pk).to.equal(2)

    expect(instance3.pk).to.equal(undefined)
    expect(instance4.pk).to.equal(undefined)

    instance1.destroy()
    instance2.destroy()
    instance3.destroy()
    instance4.destroy()
  })
})
