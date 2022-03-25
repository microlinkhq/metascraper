'use strict'

const snapshot = require('snap-shot')
const should = require('should')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

describe('metascraper-audio', () => {
  it('allow to customize keyv options', async () => {
    const cache = new Map()
    const html =
      '<meta property="twitter:player" content="https://twitter-card-player.vercel.app/audio.html">'
    const url = 'https://twitter-card-player.vercel.app'
    const metascraper = createMetascraper({ keyvOpts: { store: cache } })
    const metadata = await metascraper({ html, url })
    should(metadata.audio).be.not.null()
    should(cache.size > 0).be.true()
  })

  it('og:audio', async () => {
    const html =
      '<meta property="og:audio" content="https://browserless.js.org/static/demo.mp3">'
    const url = 'https://browserless.js.org'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('og:audio:secure_url', async () => {
    const html =
      '<meta property="og:audio:secure_url" content="https://browserless.js.org/static/demo.mp3">'
    const url = 'https://browserless.js.org'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('twitter:player', async () => {
    const html =
      '<meta property="twitter:player" content="https://twitter-card-player.vercel.app/audio.html">'
    const url = 'https://browserless.js.org'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('twitter:player:stream', async () => {
    const html =
      '<meta property="twitter:player:stream" content="https://browserless.js.org/static/demo.mp3">'
    const url = 'https://browserless.js.org'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('audio:src', async () => {
    const html = '<audio src="https://browserless.js.org/static/demo.mp3">'
    const url = 'https://browserless.js.org'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('audio:source:src', async () => {
    const html =
      '<audio><source src="https://browserless.js.org/static/demo.mp3"></source></audio>'
    const url = 'https://browserless.js.org'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('a:href', async () => {
    const html =
      '<a href="https://browserless.js.org/static/demo.mp3?some_param=this">Download</a>'
    const url = 'https://browserless.js.org'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('jsld:contentUrl', async () => {
    const html = `<script type="application/ld+json">
        {"@context":"http://schema.org","@type":"AudioObject","@id":"https://example.com/audio.mp3","contentUrl":"https://example.com/audio.mp3"}
      </script>`
    const url = 'https://browserless.js.org'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })
})
