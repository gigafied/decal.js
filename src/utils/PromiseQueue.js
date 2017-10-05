'use strict'

module.exports = class PromiseQueue {
  get length () {
    return this.queue.length
  }

  constructor () {
    this.isRunning = false
    this.queue = []
    this.next = []
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

  add (...tasks) {
    let addToQueue = task => {
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
      return p.then(val => {
        this.queue.shift()
        return val
      }).catch(err => {
        this.queue.shift()
        throw err
      })
    }
    let promise
    if (tasks.length > 1) {
      promise = Promise.all(tasks.map(task => addToQueue(task)))
    } else {
      promise = addToQueue(tasks[0])
    }
    this._run()
    return promise
  }

  pause () {
    if (this._resume) return
    let resume = new Promise((resolve, reject) => (this._resume = resolve))
    this.queue.splice(1, 0, () => {
      this.queue.shift()
      return resume
    })
  }

  resume () {
    if (this._resume) {
      this._resume()
      this._resume = null
    }
  }

  wait () {
    if (this._wait) return this._wait
    this._wait = new Promise((resolve, reject) => {
      this.queue.push(() => {
        this.queue.shift()
        this._wait = null
        resolve(this.queue.length ? this.wait() : null)
        return Promise.resolve()
      })
      this._run()
    })
    return this._wait
  }
}
