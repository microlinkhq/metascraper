'use strict'

const { default: listen } = require('async-listen')
const { createServer } = require('http')
const { promisify } = require('util')
const test = require('ava')

const closeServer = server => promisify(server.close)

const createMetascraper = (...args) =>
  require('metascraper')([require('../src')(...args)])

test('absolute http', async t => {
  const server = createServer((_, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<meta property="og:video" content="https://cdn.microlink.io/file-examples/sample.mp4">'
    )
  })

  t.teardown(() => closeServer(server))
  const url = (await listen(server, { port: 0, host: '0.0.0.0' })).toString()
  const html = `<iframe src="${url}">`
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, 'https://cdn.microlink.io/file-examples/sample.mp4')
})

test('relative http', async t => {
  const server = createServer((_, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.end('<meta property="og:video" content="/file-examples/sample.mp4">')
  })

  t.teardown(() => closeServer(server))
  const url = (await listen(server, { port: 0, host: '0.0.0.0' })).toString()
  const html = '<iframe src="/">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, url + 'file-examples/sample.mp4')
})

test('ignore non http urls', async t => {
  const server = createServer((_, res) => {
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<meta property="og:video" content="tg://join?invite=n3gS0R7pjFJhMWM0">'
    )
  })

  t.teardown(() => closeServer(server))
  const url = (await listen(server, { port: 0, host: '0.0.0.0' })).toString()
  const html = `<iframe src="${url}">`
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, null)
})
