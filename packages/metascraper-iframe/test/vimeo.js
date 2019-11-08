'use strict'

const should = require('should')

const createMetascraperIframe = require('..')
const createMetascraper = require('metascraper')

describe('metascraper-iframe » vimeo', () => {
  describe('test urls', () => {
    ;[
      'https://vimeo.com/channels/staffpicks/135373919',
      'https://vimeo.com/135373919'
    ].forEach(url => {
      it(url, async () => {
        const metascraper = createMetascraper([createMetascraperIframe()])
        const meta = await metascraper({ url, escape: false })
        should(meta.iframe).be.not.undefined()
      })
    })
  })

  it('passing specific query params', async () => {
    const url = 'https://vimeo.com/135373919'
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
