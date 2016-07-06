/**
@class decal

@method expandProps
@private
*/

'use stict'

module.exports = function (a, skipRoot) {
  a = [].concat(a)
  let b, n
  let s = []

  for (let i = 0; i < a.length; i++) {
    let p = a[i]
    if (!skipRoot && ~p.indexOf('.')) {
      b = p.split('.')
      b.splice(b.length - 1, 1)
      n = null
      while (b.length) {
        n = n ? n + '.' : ''
        n += b.splice(0, 1)[0]
        s.push(n)
      }
    }

    if (~p.indexOf(',')) {
      p = p.split('.')
      n = p.splice(0, p.length - 1).join('.')
      b = p[0].split(',')
      p = []
      for (let j = 0; j < b.length; j++) p.push([n, b[j]].join(n ? '.' : ''))
    }

    s = s.concat(p)
  }

  return s
}
