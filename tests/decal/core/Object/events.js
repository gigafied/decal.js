describe('events', function () {
  it('should be able to listen for events with on()', function () {
    let a = decal.Object.create({})
    let count = 0

    a.on('test', e => count++)
    a.emit('test')
    a.emit('test')

    expect(count).to.equal(2)
    a.destroy()
  })

  it('should be able to unlisten for events with off()', function () {
    let a = decal.Object.create({})
    let count = 0

    function fn (e) { count++ }

    a.on('test', fn)
    a.off('test', fn)

    a.emit('test')
    a.emit('test')

    expect(count).to.equal(0)
    a.destroy()
  })
})
