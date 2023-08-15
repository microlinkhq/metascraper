'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

test('og:video', async t => {
  const html =
    '<meta property="og:video" content="https://cdn.microlink.io/file-examples/sample.mp4">'
  const url = 'https://twitter.com/_developit/status/955905369242513414'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, 'https://cdn.microlink.io/file-examples/sample.mp4')
})

test('og:video:url', async t => {
  const html =
    '<meta property="og:video:url" content="https://cdn.microlink.io/file-examples/sample.mp4">'
  const url = 'https://twitter.com/_developit/status/955905369242513414'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, 'https://cdn.microlink.io/file-examples/sample.mp4')
})

test('og:video:secure_url', async t => {
  const html =
    '<meta property="og:video:secure_url" content="https://cdn.microlink.io/file-examples/sample.mp4">'
  const url = 'https://twitter.com/_developit/status/955905369242513414'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, 'https://cdn.microlink.io/file-examples/sample.mp4')
})

test('twitter:player', async t => {
  const html =
    '<meta property="twitter:player" content="https://twitter-card-player.vercel.app/container/video.html">'
  const url = 'https://twitter-card-player.vercel.app'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('twitter:player:stream', async t => {
  const html =
    '<meta property="twitter:player:stream" content="https://cdn.microlink.io/file-examples/sample.mp4">'
  const url = 'https://twitter-card-player.vercel.app'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.snapshot(metadata)
})

test('video:poster', async t => {
  const html =
    '<video poster="https://cdn.microlink.io/file-examples/sample.png"></video>'
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(metadata.image, 'https://cdn.microlink.io/file-examples/sample.png')
})

test('video:src', async t => {
  const html =
    '<video src="https://cdn.microlink.io/file-examples/sample.mp4"></video>'
  const url = 'https://metascraper.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.is(metadata.video, 'https://cdn.microlink.io/file-examples/sample.mp4')
})

test('video > source:src', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/source-src.html'))
  const url = 'https://9gag.com/gag/aGjVLDK'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('jsonld:contentUrl', async t => {
  const html = `<script type="application/ld+json">
        {"@context":"http://schema.org","@type":"VideoObject","@id":"https://example.com/video.mp4","contentUrl":"https://example.com/video.mp4"}
      </script>`
  const url = 'https://browserless.js.org'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('multiple `video > source:src`', async t => {
  const html = `
  <video controls>
    <source src="video-small.mp4" type="video/mp4" media="all and (max-width: 480px)">
    <source src="video-small.webm" type="video/webm" media="all and (max-width: 480px)">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
  </video>
  `
  const url =
    'https://www.theverge.com/2018/1/22/16921092/pentagon-secret-nuclear-bunker-reconstruction-minecraft-cns-miis-model'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.video,
    'https://www.theverge.com/2018/1/22/16921092/video-small.mp4'
  )
})

test('multiple `video > source:src` with invalid video values', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/bluecadet.com.html')
  )
  const url = 'https://www.bluecadet.com/'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('`video > source:src` with content type', async t => {
  const html = `
  <video>
    <source autoplay="" src="https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16" type="video/mp4; codecs=&quot;theora, vorbis&quot;">
  </video>
  `

  const url = 'https://app.croct.dev/'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.video,
    'https://app.croct.dev/assets/workspace/customer-assets/9d97037d-64a2-4c25-b443-bfc2972f3c9e/a0442e2b-a384-4f2b-b443-9f34c2215e16'
  )
})

test('`video > source:src` with content type and relative src', async t => {
  const html = `
  <video>
    <source src="video.mp4" type="video/mp4">
  </video>
  `
  const url = 'https://example.com'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(metadata.video, 'https://example.com/video.mp4')
})
