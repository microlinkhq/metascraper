'use strict'

const snapshot = require('snap-shot')

const metascraper = require('metascraper')([require('metascraper-audio')()])

describe('metascraper-audio', () => {
  it('og:audio', async () => {
    const html =
      '<meta property="og:audio" content="https://browserless.js.org/static/demo.mp3">'
    const url = 'https://browserless.js.org'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('og:audio:secure_url', async () => {
    const html =
      '<meta property="og:audio:secure_url" content="https://browserless.js.org/static/demo.mp3">'
    const url = 'https://browserless.js.org'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('twitter:player:stream', async () => {
    const html =
      '<meta property="twitter:player:stream" content="https://browserless.js.org/static/demo.mp3">'
    const url = 'https://browserless.js.org'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('audio:src', async () => {
    const html = '<audio src="https://browserless.js.org/static/demo.mp3">'
    const url = 'https://browserless.js.org'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('audio:source:src', async () => {
    const html =
      '<audio><source src="https://browserless.js.org/static/demo.mp3"></source></audio>'
    const url = 'https://browserless.js.org'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('a:href', async () => {
    const html =
      '<a href="https://browserless.js.org/static/demo.mp3?some_param=this">Download</a>'
    const url = 'https://browserless.js.org'

    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('jsld:contentUrl', async () => {
    const html = `<script type="application/ld+json">
        {"@context":"http://schema.org","@type":"AudioObject","@id":"https://example.com/audio.mp3","contentUrl":"https://example.com/audio.mp3"}
      </script>`
    const url = 'https://browserless.js.org'

    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })
})
