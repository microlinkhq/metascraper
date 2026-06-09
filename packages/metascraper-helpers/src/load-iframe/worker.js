'use strict'

const { workerData, parentPort } = require('node:worker_threads')
const { JSDOM, VirtualConsole, requestInterceptor } = require('jsdom')

const iframeInterceptor = requestInterceptor(async (request, { element }) => {
  if (element?.localName !== 'iframe') return

  const response = await fetch(request)
  if (!response.ok) return new Response('', { status: response.status })

  const headers = new Headers(response.headers)
  headers.delete('content-encoding')
  headers.delete('content-length')
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText
  })
})

async function main ({ url, html, timeout }) {
  const dom = new JSDOM(html, {
    url,
    virtualConsole: new VirtualConsole(),
    runScripts: 'dangerously',
    resources: { interceptors: [iframeInterceptor] }
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

main(workerData)
  .then(html => parentPort.postMessage(html))
  .catch(() => parentPort.postMessage(undefined))
