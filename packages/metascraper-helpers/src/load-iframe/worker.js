'use strict'

const { workerData, parentPort } = require('node:worker_threads')
const { JSDOM, VirtualConsole } = require('jsdom')

async function main ({ url, html, timeout }) {
  const dom = new JSDOM(html, {
    url,
    virtualConsole: new VirtualConsole(),
    runScripts: 'dangerously',
    resources: 'usable'
  })

  const iframe = dom.window.document.querySelector('iframe')
  if (!iframe) return

  let timeoutId

  const waitForIframe = new Promise(resolve => {
    iframe.addEventListener(
      'load',
      () => {
        clearTimeout(timeoutId)
        resolve(iframe.contentDocument.documentElement.outerHTML)
      },
      { once: true }
    )
  })

  const timeoutReached = new Promise(
    resolve => (timeoutId = setTimeout(resolve, timeout))
  )

  return Promise.race([waitForIframe, timeoutReached])
}

main(workerData).then(html => parentPort.postMessage(html))
