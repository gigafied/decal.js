describe('find + filter', function () {
  it('should find an item in an array', function () {
    let a = decal.Array.create(
      {val: 5},
      {val: 3},
      {val: 1},
      {val: 4},
      {val: 2}
    )

    let b = a.find(item => item.val === 1)

    expect(b).to.deep.equal({val: 1})
    a.destroy()
  })

  it('should find an item in an array with findBy', function () {
    let a = decal.Array.create(
      {val: 5},
      {val: 3},
      {val: 1},
      {val: 4},
      {val: 2}
    )

    let b = a.findBy('val', 3)
    expect(b).to.deep.equal({val: 3})
    a.destroy()
  })

  it('should filter an array properly', function () {
    let a = decal.Array.create(
      {val: 1, hidden: true},
      {val: 2, hidden: false},
      {val: 3, hidden: true},
      {val: 4, hidden: false},
      {val: 5, hidden: true}
    )

    let b = a.filter(item => !item.hidden)
    expect(b.toArray()).to.deep.equal([
      {val: 2, hidden: false},
      {val: 4, hidden: false}
    ])
    a.destroy()
  })

  it('should filter an array with filterBy', function () {
    let a = decal.Array.create(
      {val: 1, hidden: true},
      {val: 2, hidden: false},
      {val: 3, hidden: true},
      {val: 4, hidden: false},
      {val: 5, hidden: true}
    )

    let b = a.filterBy('hidden', true)

    expect(b.toArray()).to.deep.equal([
      {val: 1, hidden: true},
      {val: 3, hidden: true},
      {val: 5, hidden: true}
    ])
    a.destroy()
  })
})
