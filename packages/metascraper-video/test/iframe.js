'use strict'

const test = require('ava')

const { runServer } = require('./helpers')

const createMetascraper = (...args) =>
  require('metascraper')([require('../src')(...args)])

test('absolute http', async t => {
  const url = await runServer(t, ({ res }) => {
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<meta property="og:video" content="https://cdn.microlink.io/file-examples/sample.mp4">'
    )
  })
  const html = `<iframe src="${url}">`
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, 'https://cdn.microlink.io/file-examples/sample.mp4')
})

test('relative http', async t => {
  const url = await runServer(t, ({ res }) => {
    res.setHeader('Content-Type', 'text/html')
    res.end('<meta property="og:video" content="/file-examples/sample.mp4">')
  })
  const html = '<iframe src="/">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, url + 'file-examples/sample.mp4')
})

test('ignore non http urls', async t => {
  const url = await runServer(t, ({ res }) => {
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<meta property="og:video" content="tg://join?invite=n3gS0R7pjFJhMWM0">'
    )
  })
  const html = `<iframe src="${url}">`
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, null)
})
