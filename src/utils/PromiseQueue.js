'use strict'

module.exports = class PromiseQueue {
  get length () {
    return this.queue.length
  }

  constructor () {
    this.isRunning = false
    this.queue = []
  }

  _run () {
    if (this.isRunning) return
    this.isRunning = true
    let next = () => {
      if (!this.queue.length) {
        this.isRunning = false
        return Promise.resolve()
      }
      this.queue[0]().then(next).catch(next)
    }
    this.queue[0]().then(next).catch(next)
  }

  add (task) {
    let p = new Promise((resolve, reject) => {
      this.queue.push(() => {
        try {
          resolve(task())
        } catch (err) {
          reject(err)
        }
        return p
      })
    })
    this._run()
    return p.then(val => {
      this.queue.shift()
      return val
    }).catch(err => {
      this.queue.shift()
      throw err
    })
  }
}
