'use strict'

const should = require('should')

const createMetascraperIframe = require('..')
const createMetascraper = require('metascraper')

describe('metascraper-iframe » spotify', () => {
  describe('test urls', () => {
    ;[
      'https://open.spotify.com/track/63W11KVHDOpSlh3XMQ7qMg?si=Yd-hIkD9TtSUeFeR0jzKsA',
      'https://open.spotify.com/playlist/1xY6msLHX1W34EzB0UkkbU?si=cFF7LjzgQxWz5ni6TCN_jA'
    ].forEach(url => {
      it(url, async () => {
        const metascraper = createMetascraper([createMetascraperIframe()])
        const meta = await metascraper({ url, escape: false })
        should(meta.iframe).be.not.null()
      })
    })
  })

  it('passing specific query params', async () => {
    const url =
      'https://open.spotify.com/track/63W11KVHDOpSlh3XMQ7qMg?si=Yd-hIkD9TtSUeFeR0jzKsA'
    const metascraper = createMetascraper([createMetascraperIframe()])
    const meta = await metascraper({
      url,
      escape: false,
      autoplay: 1,
      loop: 1,
      autopause: 0
    })
    should(meta.iframe.includes('autoplay=1&loop=1&autopause=0')).be.true()
  })
})
