'use strict'

const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

test('og:audio', async t => {
  const html =
    '<meta property="og:audio" content="https://cdn.microlink.io/file-examples/sample.mp3">'
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, 'https://cdn.microlink.io/file-examples/sample.mp3')
})

test('og:audio:url', async t => {
  const html =
    '<meta property="og:audio:url" content="https://cdn.microlink.io/file-examples/sample.mp3">'
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, 'https://cdn.microlink.io/file-examples/sample.mp3')
})

test('og:audio:secure_url', async t => {
  const html =
    '<meta property="og:audio:secure_url" content="https://cdn.microlink.io/file-examples/sample.mp3">'
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, 'https://cdn.microlink.io/file-examples/sample.mp3')
})

test('audio:src', async t => {
  const html = '<audio src="https://cdn.microlink.io/file-examples/sample.mp3">'
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('audio > source:src', async t => {
  const html =
    '<audio><source src="https://cdn.microlink.io/file-examples/sample.mp3"></source></audio>'
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('a:href', async t => {
  const html =
    '<a href="https://cdn.microlink.io/file-examples/sample.mp3?some_param=this">Download</a>'
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('jsonld:contentUrl', async t => {
  const html = `<script type="application/ld+json">
        {"@context":"http://schema.org","@type":"AudioObject","@id":"https://example.com/audio.mp3","contentUrl":"https://example.com/audio.mp3"}
      </script>`
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test.todo('multiple `audio > source:src`')
test.todo('multiple `audio > source:src` with invalid video values')
test.todo('`audio > source:src` with content type')
test.todo('`audio > source:src` with content type and relative src')
