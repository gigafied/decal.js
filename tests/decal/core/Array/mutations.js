describe('mutations', function () {
  it('should allow pushing items with push()', function () {
    let a = decal.Array.create(1, 2, 3)
    expect(a.toArray()).to.deep.equal([1, 2, 3])

    a.push(4, 5, 6)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6])

    a.destroy()
  })

  it('should allow adding items with insertAt()', function () {
    let a = decal.Array.create(1, 2, 3)
    expect(a.toArray()).to.deep.equal([1, 2, 3])

    a.insertAt(3, 4)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4])

    a.destroy()
  })

  it('should allow removing items with remove()', function () {
    let a = decal.Array.create(1, 2, 3, 4, 5, 6)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6])

    a.remove(3)
    expect(a.toArray()).to.deep.equal([1, 2, 4, 5, 6])

    a.destroy()
  })

  it('should allow removing items with removeAt()', function () {
    let a = decal.Array.create(1, 2, 3, 4, 5, 6)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6])

    a.removeAt(0)
    expect(a.toArray()).to.deep.equal([2, 3, 4, 5, 6])

    a.destroy()
  })

  it('should allow removing items with pop()', function () {
    let a = decal.Array.create(1, 2, 3, 4, 5, 6)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6])

    let b = a.pop()

    expect(b).to.equal(6)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5])

    a.destroy()
  })

  it('should allow removing items with shift()', function () {
    let a = decal.Array.create(1, 2, 3, 4, 5, 6)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6])

    let b = a.shift()

    expect(b).to.equal(1)
    expect(a.toArray()).to.deep.equal([2, 3, 4, 5, 6])

    a.destroy()
  })

  it('should allow adding/removing items with splice()', function () {
    let a = decal.Array.create(1, 1, 1)
    expect(a.toArray()).to.deep.equal([1, 1, 1])
    a.splice(1, 2, 2, 3, 4)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4])

    a.destroy()
  })

  it('should allow adding items with unshift()', function () {
    let a = decal.Array.create(4, 5, 6)
    expect(a.toArray()).to.deep.equal([4, 5, 6])
    a.unshift(1, 2, 3)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4, 5, 6])

    a.destroy()
  })

  it('should allow replacing items', function () {
    let a = decal.Array.create(0, 2, 3)
    expect(a.toArray()).to.deep.equal([0, 2, 3])

    a.replace(0, 1)
    expect(a.toArray()).to.deep.equal([1, 2, 3])

    a.destroy()
  })

  it('should allow replacing with replaceAt()', function () {
    let a = decal.Array.create(1, 2, 3, 0)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 0])

    a.replaceAt(3, 4)
    expect(a.toArray()).to.deep.equal([1, 2, 3, 4])

    a.destroy()
  })

  it('should trigger added event on addition of items', function (done) {
    let a = decal.Array.create(1, 2, 3)
    a.on('add', function (item) {
      expect(item).to.equal(4)
      done()
    })
    a.push(4)
  })

  it('should trigger removed event on removal of items', function (done) {
    let a = decal.Array.create(1, 2, 3)
    a.on('remove', function (item) {
      expect(item).to.equal(2)
      done()
    })
    a.removeAt(1)
  })

  it('should bubble events from items in the array', function (done) {
    let a = decal.Object.create({test: 'a'})
    let b = decal.Object.create({test: 'b'})
    let c = decal.Object.create({test: 'c'})

    let arr = decal.Array.create(a, b, c)
    let count = 0
    let triggered = []

    arr.on('item.test', function (item) {
      triggered.push(item)

      if (++count === 3) {
        expect(triggered).to.have.members([a, b, c])
        a.destroy()
        b.destroy()
        c.destroy()
        arr.destroy()
        done()
      }
    })

    a.emit('test')
    b.emit('test')
    c.emit('test')
  })
})
