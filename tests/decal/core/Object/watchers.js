describe('watchers', function () {
  it('should be able to add watchers to decal.Object instances', function (done) {
    let a = decal.Object.create({
      test: 1
    })

    a.watch('test', function () {
      expect(a.test).to.equal(10)
      a.test = 20
      a.destroy()
      done()
    })

    expect(a.test).to.equal(1)
    a.test = 10
    expect(a.test).to.equal(10)
  })
})
