'use strict'

const should = require('should')

const createMetascraperIframe = require('..')
const createMetascraper = require('metascraper')

describe('metascraper-iframe » youtube', () => {
  describe('test urls', () => {
    ;[
      'https://www.youtube.com/watch?feature=player_embedded&v=21Lk4YiASMo',
      'https://youtu.be/21Lk4YiASMo',
      'https://www.youtube.com/channel/UCL8ZULXASCc1I_oaOT0NaOQ',
      'http://www.youtube.com/user/googlechrome',
      'https://www.youtube.com/playlist?list=PL5308B2E5749D1696',
      'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=21Lk4YiASMo',
      'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/playlist?list=PL5308B2E5749D1696'
    ].forEach(url => {
      it(url, async () => {
        const metascraper = createMetascraper([createMetascraperIframe()])
        const meta = await metascraper({ url, escape: false })
        should(meta.iframe).be.not.undefined()
      })
    })
  })

  it('passing specific query params', async () => {
    const url = 'https://www.youtube.com/watch?v=21Lk4YiASMo'
    const metascraper = createMetascraper([createMetascraperIframe()])
    const meta = await metascraper({ url, escape: false, wmode: 'opaque' })
    should(meta.iframe.includes('wmode=opaque')).be.true()
  })
})
