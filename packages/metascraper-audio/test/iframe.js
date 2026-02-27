'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { runServer } = require('./helpers')

const createMetascraper = (...args) =>
  require('metascraper')([require('../src')(...args)])

test('absolute http', async t => {
  const url = await runServer(t, ({ res }) => {
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<meta property="og:audio" content="https://cdn.microlink.io/file-examples/sample.mp3">'
    )
  })
  const html = `<iframe src="${url}">`
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, 'https://cdn.microlink.io/file-examples/sample.mp3')
})

test('relative http', async t => {
  const url = await runServer(t, ({ res }) => {
    res.setHeader('Content-Type', 'text/html')
    res.end('<meta property="og:audio" content="/file-examples/sample.mp3">')
  })
  const html = '<iframe src="/">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, url + 'file-examples/sample.mp3')
})

test('ignore non http urls', async t => {
  const url = await runServer(t, ({ res }) => {
    res.setHeader('Content-Type', 'text/html')
    res.end(
      '<meta property="og:audio" content="tg://join?invite=n3gS0R7pjFJhMWM0">'
    )
  })
  const html = `<iframe src="${url}">`
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, null)
})

test('stop iframe probing after first audio match', async t => {
  const calls = []
  const metascraper = createMetascraper({
    getIframe: async (url, $, { src }) => {
      calls.push(src)
      if (src.endsWith('/ok')) {
        return cheerio.load(
          '<meta property="og:audio" content="https://cdn.microlink.io/file-examples/sample.mp3">'
        )
      }
      throw new Error('should not be called')
    }
  })

  const metadata = await metascraper({
    url: 'https://example.com',
    html: '<iframe src="/ok"></iframe><iframe src="/skip"></iframe>'
  })

  t.is(metadata.audio, 'https://cdn.microlink.io/file-examples/sample.mp3')
  t.deepEqual(calls, ['https://example.com/ok'])
})

test('dedupe normalized iframe urls while probing', async t => {
  let calls = 0
  const metascraper = createMetascraper({
    getIframe: async (url, $, { src }) => {
      calls += 1
      t.is(src, 'https://example.com/dup')
      return cheerio.load('<meta property="og:title" content="No audio">')
    }
  })

  const metadata = await metascraper({
    url: 'https://example.com',
    html: '<iframe src="/dup"></iframe><iframe src="https://example.com/dup"></iframe>'
  })

  t.is(metadata.audio, null)
  t.is(calls, 1)
})
