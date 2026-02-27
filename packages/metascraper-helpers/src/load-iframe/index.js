'use strict'

const { Worker } = require('worker_threads')
const path = require('path')

const SCRIPT_PATH = (
  v => () =>
    v ?? (v = path.resolve(__dirname, 'worker.js'))
)()

module.exports = (url, $, { timeout = 5000 } = {}) => {
  const worker = new Worker(SCRIPT_PATH(), {
    workerData: { url, html: $.html(), timeout }
  })
  const { promise, resolve, reject } = Promise.withResolvers()
  let settled = false

  const onMessage = html => {
    if (settled) return
    settled = true
    resolve($.load(html || ''))
    worker.terminate().catch(() => {})
  }

  const onError = error => {
    if (settled) return
    settled = true
    reject(error)
    worker.terminate().catch(() => {})
  }

  const onExit = code => {
    if (settled) return
    settled = true
    if (code === 0) {
      resolve($.load(''))
      return
    }
    reject(new Error(`loadIframe worker exited unexpectedly with code ${code}`))
  }

  worker.once('message', onMessage)
  worker.once('error', onError)
  worker.once('exit', onExit)
  return promise
}
