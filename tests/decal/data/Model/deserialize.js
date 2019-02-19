describe('deserialize', function () {
  it('should properly deserialize objects into records.', function () {
    let Model = decal.Model.extend({
      a: decal.attr({key: 'a2'}),
      b: decal.attr({key: 'b2'})
    })

    let json = [
      {a2: '1', b2: '2'},
      {a2: '2', b2: '3'},
      {a2: '3', b2: '4'},
      {a2: '4', b2: '5'}
    ]

    let instance1 = Model.create()
    let instance2 = Model.create()
    let instance3 = Model.create()
    let instance4 = Model.create()

    instance1.deserialize(json[0])
    instance2.deserialize(json[1])
    instance3.deserialize(json[2])
    instance4.deserialize(json[3])

    expect(instance1.a).to.equal('1')
    expect(instance1.b).to.equal('2')

    expect(instance2.a).to.equal('2')
    expect(instance2.b).to.equal('3')

    expect(instance3.a).to.equal('3')
    expect(instance3.b).to.equal('4')

    expect(instance4.a).to.equal('4')
    expect(instance4.b).to.equal('5')

    expect([instance1.serialize(), instance2.serialize(), instance3.serialize(), instance4.serialize()]).to.deep.equal(json)

    instance1.destroy()
    instance2.destroy()
    instance3.destroy()
    instance4.destroy()
  })

  it('should properly deserialize nested keys.', function () {
    let Model = decal.Model.extend({
      a: decal.attr({key: 'a.b.c.d'})
    })

    let json = {
      a: {
        b: {
          c: {
            d: 'test'
          }
        }
      }
    }

    let instance = Model.create()
    instance.deserialize(json)

    expect(instance.a).to.equal('test')
    expect(instance.serialize()).to.deep.equal(json)

    instance.destroy()
  })

  it('should properly deserialize primary keys.', function () {
    let Model = decal.Model.extend({
      primaryKey: 'uuid'
    })

    let instance = Model.create()
    instance.deserialize({uuid: 'xxx'})
    expect(instance.pk).to.equal('xxx')
    instance.destroy()
  })

  it('should not override dirty properties by default.', function () {
    let Model = decal.Model.extend({
      a: decal.attr(),
      b: decal.attr(),
      c: decal.attr()
    })

    let instance = Model.create({a: 0, b: 0, c: 0})
    instance.a = 1
    instance.b = 2
    instance.c = 3

    let json = {
      a: 4,
      b: 5,
      c: 6
    }

    instance.deserialize(json)

    expect(instance.a).to.equal(1)
    expect(instance.b).to.equal(2)
    expect(instance.c).to.equal(3)

    instance.destroy()
  })

  it('should override dirty properties if override === true.', function () {
    let Model = decal.Model.extend({
      a: decal.attr(),
      b: decal.attr(),
      c: decal.attr()
    })

    let instance = Model.create({a: 0, b: 0, c: 0})
    instance.a = 1
    instance.b = 2
    instance.c = 3

    let json = {
      a: 4,
      b: 5,
      c: 6
    }

    instance.deserialize(json, true)

    expect(instance.a).to.equal(4)
    expect(instance.b).to.equal(5)
    expect(instance.c).to.equal(6)

    instance.destroy()
  })

  it('should not mark properties as dirty when set via deserialize()', function () {
    let Model = decal.Model.extend({
      a: decal.attr(),
      b: decal.attr(),
      c: decal.attr()
    })

    let instance = Model.create({a: 0, b: 0, c: 0})
    expect(instance.dirtyAttributes.length).to.equal(0)

    instance.deserialize({a: 1, c: 3})
    expect(instance.dirtyAttributes.indexOf('a')).to.equal(-1)
    expect(instance.dirtyAttributes.indexOf('c')).to.equal(-1)

    instance.b = 2
    expect(instance.dirtyAttributes.indexOf('b')).to.not.equal(-1)

    instance.destroy()
  })

  it('should apply filterers to properties', function () {
    let Model = decal.Model.extend({
      a: decal.attr({key: 'a.b.c.d', readOnly: true})
    })

    let json = {
      a: {
        b: {
          c: {
            d: 'test'
          }
        }
      }
    }

    let instance = Model.create()
    instance.deserialize(json, false, function (meta) {
      return !meta.opts.readOnly
    })

    expect(instance.serialize()).to.deep.equal({})

    instance.destroy()
  })
})
