'use strict'

const { workerData, parentPort } = require('node:worker_threads')
const { Readability } = require('@mozilla/readability')

const parseReader = reader => {
  try {
    return reader.parse()
  } catch (_) {
    return {}
  }
}

const errorCapture =
  process.env.NODE_ENV === 'test' ? 'tryAndCatch' : 'processLevel'

const getDocument = ({ url, html }) => {
  const { Window } = require('happy-dom')
  const window = new Window({
    url,
    settings: { errorCapture }
  })
  const document = window.document
  document.write(html)
  return document
}

const main = async ({ url, html, readabilityOpts } = {}) => {
  const document = getDocument({ url, html })
  const reader = new Readability(document, readabilityOpts)
  return parseReader(reader)
}

main(workerData).then(result => parentPort.postMessage(JSON.stringify(result)))
