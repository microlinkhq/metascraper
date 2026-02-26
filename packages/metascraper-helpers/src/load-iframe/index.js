'use strict'

const { Worker } = require('worker_threads')
const path = require('path')

const SCRIPT_PATH = (
  v => () =>
    v ?? (v = path.resolve(__dirname, 'worker.js'))
)()

module.exports = (url, $, { timeout = 5000 } = {}) => {
  const worker = new Worker(SCRIPT_PATH(), {
    workerData: { url, html: $.html(), timeout },
    stdout: true,
    stderr: true
  })
  return new Promise((resolve, reject) => {
    worker.on('message', html => resolve($.load(html || '')))
    worker.on('error', reject)
  })
}
