'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
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
      '<meta name="twitter:player" content="https://twitter-card-player.vercel.app/container/video.html">'
  })

  t.truthy(metadataOne.video)
  t.is(cache.size, 1)

  const metadataTwo = await metascraper({
    url,
    html:
      '<meta name="twitter:player" content="https://twitter-card-player.vercel.app/container-fail.html">'
  })

  t.falsy(metadataTwo.audio)
  t.is(cache.size, 2)
})

test('get image from src:poster', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/source-poster.html'))
  const url = 'https://gfycat.com/gifs/detail/timelyhealthyarmadillo'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('get video from source:src', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/video-src.html'))
  const url =
    'https://www.theverge.com/2018/1/22/16921092/pentagon-secret-nuclear-bunker-reconstruction-minecraft-cns-miis-model'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('get video from multiple source:src', async t => {
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
  t.snapshot(metadata)
})

test('get video from multiple source:src with no valid video values', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/bluecadet.com.html')
  )
  const url = 'https://www.bluecadet.com/'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('<source src />', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/source-src.html'))
  const url = 'https://9gag.com/gag/aGjVLDK'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('og:video', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/tweet.html'))
  const url = 'https://twitter.com/_developit/status/955905369242513414'
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

test('twitter:player', async t => {
  const html =
    '<meta name="twitter:player" content="https://twitter-card-player.vercel.app/container/video.html">'
  const url = 'https://twitter-card-player.vercel.app'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('clips.twitch.tv', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/clip.twitch.tv.html')
  )
  const url = 'https://clips.twitch.tv/AwkwardBoredWaffleItsBoshyTime'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('play.tv', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/play.tv.html')
  )
  const url = 'https://plays.tv/video/5a6f64b1bef69a7fa9/holy-shit'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('9gag', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/9gag.html')
  )
  const url = 'https://9gag.com/gag/abY5Mm9'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.true(metadata.video.endsWith('.mp4'))
})
