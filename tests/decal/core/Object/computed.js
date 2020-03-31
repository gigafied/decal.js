describe('computed properties', function () {
  it('should be able to watch computed properties for changes (METHOD 1)', function (done) {
    let a = decal.Object.create({
      num1: 1,
      num2: 2,
      sum: decal.computed(function () {
        return this.num1 + this.num2
      }, ['num1', 'num2'])
    })

    a.watch('sum', function () {
      expect(a.sum).to.equal(15)
      a.destroy()
      done()
    })

    a.num1 = 5
    a.num2 = 10
  })

  it('should be able to watch computed properties for changes (METHOD 2)', function (done) {
    let a = decal.Object.create({
      num1: 1,
      num2: 2,
      sum: decal.computed({
        watch: ['num1', 'num2'],

        get: function () {
          return this.num1 + this.num2
        }
      })
    })

    a.watch('sum', function () {
      expect(a.sum).to.equal(15)
      a.destroy()
      done()
    })

    a.num1 = 5
    a.num2 = 10
  })

  it('should be able to watch computed properties if only one property is changed', function (done) {
    let a = decal.Object.create({
      num1: 1,
      num2: 2,
      sum: decal.computed(function () {
        return this.num1 + this.num2
      }, ['num1', 'num2'])
    })

    a.watch('sum', function () {
      expect(a.sum).to.equal(11)
      a.destroy()
      done()
    })

    a.num2 = 10
  })

  it('should be able to watch computed properties if only one property is changed', function (done) {
    let a = decal.Object.create({
      num1: 1,
      num2: 2,
      sum: decal.computed({
        watch: ['num1', 'num2'],

        get: function () {
          return this.num1 + this.num2
        }
      })
    })

    a.watch('sum', function () {
      expect(a.sum).to.equal(7)
      a.destroy()
      done()
    })

    a.num1 = 5
  })
})
