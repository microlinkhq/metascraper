'use strict'

const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('../src')(...args)])

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

test('multiple `audio > source:src`', async t => {
  const html = `
    <audio controls>
      <source src="audio-small.wav" media="all and (max-width: 480px)">
      <source src="audio-small.mp3" media="all and (max-width: 480px)">
    </audio>
    `
  const url =
    'https://www.theverge.com/2018/1/22/16921092/pentagon-secret-nuclear-bunker-reconstruction-minecraft-cns-miis-model'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(
    metadata.audio,
    'https://www.theverge.com/2018/1/22/16921092/audio-small.wav'
  )
})

test('`audio > source:src` with content type', async t => {
  const html = `
    <audio controls>
      <source src="https://www.theverge.com/audio-small" type="audio/mpeg; codecs="vorbis"" media="all and (max-width: 480px)">
    </audio>
    `
  const url =
    'https://www.theverge.com/2018/1/22/16921092/pentagon-secret-nuclear-bunker-reconstruction-minecraft-cns-miis-model'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, 'https://www.theverge.com/audio-small')
})

test('multiple `audio > source:src` with invalid audio values', async t => {
  const html = `
    <audio controls>
      <source src="0" media="all and (max-width: 480px)">
      <source src="audio-small.mp3" media="all and (max-width: 480px)">
    </audio>
    `
  const url =
    'https://www.theverge.com/2018/1/22/16921092/pentagon-secret-nuclear-bunker-reconstruction-minecraft-cns-miis-model'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(
    metadata.audio,
    'https://www.theverge.com/2018/1/22/16921092/audio-small.mp3'
  )
})

test('`audio > source:src` with content type and relative src', async t => {
  const html = `
    <audio controls>
      <source src="audio-small" type="audio/mpeg" media="all and (max-width: 480px)">
    </audio>
    `
  const url =
    'https://www.theverge.com/2018/1/22/16921092/pentagon-secret-nuclear-bunker-reconstruction-minecraft-cns-miis-model'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(
    metadata.audio,
    'https://www.theverge.com/2018/1/22/16921092/audio-small'
  )
})
