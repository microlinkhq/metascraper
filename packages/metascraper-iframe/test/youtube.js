'use strict'

const should = require('should')

const createMetascraperIframe = require('..')
const createMetascraper = require('metascraper')

describe('metascraper-iframe » youtube', () => {
  describe('test urls', () => {
    ;[
      'https://www.youtube.com/watch?v=Gu8X7vM3Avw',
      'https://youtu.be/Gu8X7vM3Avw',
      'https://www.youtube.com/watch?v=-TWztwbOpog&list=PL5aqr5w5fRe4nO30px44D5sBukIUw1UwX'
    ].forEach(url => {
      it(url, async () => {
        const metascraper = createMetascraper([createMetascraperIframe()])
        const meta = await metascraper({ url, escape: false })
        should(meta.iframe).be.not.null()
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
