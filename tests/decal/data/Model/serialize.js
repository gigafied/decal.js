describe('serialize', function () {
  it('should properly serialize default values.', function (done) {
    let Model = decal.Model.extend({
      a: decal.attr({defaultValue: 'a'}),
      b: decal.attr({defaultValue: 'b'}),
      c: decal.attr({defaultValue: 'c'})
    })

    let instance = Model.create()
    let expected = {a: 'a', b: 'b', c: 'c'}
    let json = instance.serialize()

    expect(json).to.deep.equal(expected)
    done()
  })

  it('should properly serialize nested keys.', function (done) {
    let Model = decal.Model.extend({
      a: decal.attr({key: 'a.b.c.d'})
    })

    let instance = Model.create()
    instance.a = 'test'

    let expected = {
      a: {
        b: {
          c: {
            d: 'test'
          }
        }
      }
    }

    let json = instance.serialize()
    expect(json).to.deep.equal(expected)

    done()
  })

  it('should properly serialize primary keys.', function (done) {
    let Model = decal.Model.extend({
      primaryKey: 'uuid'
    })

    let instance = Model.create()
    instance.pk = 'xxx'

    let expected = {
      uuid: 'xxx'
    }

    let json = instance.serialize()
    expect(json).to.deep.equal(expected)

    done()
  })

  it('should properly filter nested keys', function (done) {
    let Model = decal.Model.extend({
      a: decal.attr({key: 'a.b.c.d', internal: true})
    })

    let instance = Model.create()
    instance.a = 'test'

    let json = instance.serialize(meta => !meta.opts.internal)
    expect(json).to.deep.equal({})

    done()
  })
})
