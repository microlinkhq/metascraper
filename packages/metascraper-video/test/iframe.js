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

test('stop iframe probing after first video match', async t => {
  const calls = []
  const metascraper = createMetascraper({
    getIframe: async (url, $, { src }) => {
      calls.push(src)
      if (src.endsWith('/ok')) {
        return cheerio.load(
          '<meta property="og:video" content="https://cdn.microlink.io/file-examples/sample.mp4">'
        )
      }
      throw new Error('should not be called')
    }
  })

  const metadata = await metascraper({
    url: 'https://example.com',
    html: '<iframe src="/ok"></iframe><iframe src="/skip"></iframe>',
    pickPropNames: new Set(['video'])
  })

  t.is(metadata.video, 'https://cdn.microlink.io/file-examples/sample.mp4')
  t.deepEqual(calls, ['https://example.com/ok'])
})

test('reuse iframe fetch across image and video extraction', async t => {
  let calls = 0
  const metascraper = createMetascraper({
    getIframe: async (url, $, { src }) => {
      calls += 1
      t.is(src, 'https://example.com/ok')
      return cheerio.load(`
        <video
          poster="https://cdn.microlink.io/file-examples/sample.png"
          src="https://cdn.microlink.io/file-examples/sample.mp4"
        ></video>
      `)
    }
  })

  const metadata = await metascraper({
    url: 'https://example.com',
    html: '<iframe src="/ok"></iframe>'
  })

  t.is(metadata.image, 'https://cdn.microlink.io/file-examples/sample.png')
  t.is(metadata.video, 'https://cdn.microlink.io/file-examples/sample.mp4')
  t.is(calls, 1)
})
