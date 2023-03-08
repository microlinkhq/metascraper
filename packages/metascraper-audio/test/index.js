'use strict'

const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

test('provide `keyvOpts`', async t => {
  const cache = new Map()
  const url = 'https://twitter-card-player.vercel.app'
  const metascraper = createMetascraper({
    gotOpts: { retry: 0 },
    keyvOpts: { store: cache }
  })

  const metadataOne = await metascraper({
    url,
    html:
      '<meta property="twitter:player" content="https://twitter-card-player.vercel.app/container/audio.html">'
  })

  t.truthy(metadataOne.audio)
  t.is(cache.size, 1)

  const metadataTwo = await metascraper({
    url,
    html:
      '<meta property="twitter:player" content="https://twitter-card-player.vercel.app/audio-fail.html">'
  })

  t.falsy(metadataTwo.audio)
  t.is(cache.size, 2)
})

test('og:audio', async t => {
  const html =
    '<meta property="og:audio" content="https://browserless.js.org/static/demo.mp3">'
  const url = 'https://browserless.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('og:audio:secure_url', async t => {
  const html =
    '<meta property="og:audio:secure_url" content="https://browserless.js.org/static/demo.mp3">'
  const url = 'https://browserless.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('twitter:player', async t => {
  const html =
    '<meta property="twitter:player" content="https://twitter-card-player.vercel.app/container/audio.html">'
  const url = 'https://twitter-card-player.vercel.app'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('twitter:player:stream', async t => {
  const html =
    '<meta property="twitter:player:stream" content="https://cdn.microlink.io/file-examples/sample.mp3">'
  const url = 'https://twitter-card-player.vercel.app'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('audio:src', async t => {
  const html = '<audio src="https://browserless.js.org/static/demo.mp3">'
  const url = 'https://browserless.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('audio:source:src', async t => {
  const html =
    '<audio><source src="https://browserless.js.org/static/demo.mp3"></source></audio>'
  const url = 'https://browserless.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('a:href', async t => {
  const html =
    '<a href="https://browserless.js.org/static/demo.mp3?some_param=this">Download</a>'
  const url = 'https://browserless.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('jsld:contentUrl', async t => {
  const html = `<script type="application/ld+json">
        {"@context":"http://schema.org","@type":"AudioObject","@id":"https://example.com/audio.mp3","contentUrl":"https://example.com/audio.mp3"}
      </script>`
  const url = 'https://browserless.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})
