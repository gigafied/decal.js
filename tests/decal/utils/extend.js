describe('extend', function () {
  it('should properly shallow extend objects.', function () {
    let c = {c: 'test'}
    let a = {b: c}

    let test = {a}

    let test2 = decal.extend({}, test)

    expect(test2).to.not.equal(test)
    expect(test2.a).to.equal(a)
    expect(test2.a.b).to.equal(c)

    expect(test2).to.deep.equal(test)
    expect(test2.a).to.deep.equal(a)
    expect(test2.a.b).to.deep.equal(c)
  })

  it('should properly deep extend objects.', function () {
    let c = {c: 'test'}
    let a = {b: c}

    let test = {
      a: a
    }

    let test2 = decal.extend('', true, test)

    expect(test2).to.not.equal(test)
    expect(test2.a).to.not.equal(a)
    expect(test2.a.b).to.not.equal(c)

    expect(test2).to.deep.equal(test)
    expect(test2.a).to.deep.equal(a)
    expect(test2.a.b).to.deep.equal(c)
  })

  it('should properly deep extend arrays.', function () {
    let c = {c: 'test'}
    let a = {b: c}

    let test = [
      {a: a},
      {a: a},
      {a: a},
      [
        {a: a},
        {a: a}
      ]
    ]

    let test2 = decal.extend([], true, test)

    expect(test2).to.not.equal(test)
    expect(test2[0].a).to.not.equal(a)
    expect(test2[1].a.b).to.not.equal(c)
    expect(test2[0]).to.not.equal(test2[1])
    expect(test2[3][0]).to.not.equal(test2[3][1])

    expect(test2).to.deep.equal(test)
    expect(test2[0].a).to.deep.equal(a)
    expect(test2[1].a.b).to.deep.equal(c)
    expect(test2[0]).to.deep.equal(test2[1])

    expect(test2[3][0]).to.deep.equal(test[0])
  })

  it('should properly defense Prototype Pollution', function () {
    let a = {}
    let b = JSON.parse('{"__proto__": {"pollute": "1"}}')
    decal.extend(a, true, b)
    let c = {}
    expect(c.pollute).to.not.equal('1')
  })
})
