'use strict'

const should = require('should')

const createMetascraperIframe = require('..')
const createMetascraper = require('metascraper')

const { isValidUrl } = createMetascraperIframe

const urls = [
  'https://www.youtube.com/watch?v=Gu8X7vM3Avw',
  'https://youtu.be/Gu8X7vM3Avw',
  'https://www.youtube.com/watch?v=-TWztwbOpog&list=PL5aqr5w5fRe4nO30px44D5sBukIUw1UwX',
  'https://open.spotify.com/track/63W11KVHDOpSlh3XMQ7qMg?si=Yd-hIkD9TtSUeFeR0jzKsA',
  'https://open.spotify.com/playlist/1xY6msLHX1W34EzB0UkkbU?si=cFF7LjzgQxWz5ni6TCN_jA',
  'https://vimeo.com/channels/staffpicks/135373919',
  'https://vimeo.com/135373919'
]

describe('metascraper-iframe', () => {
  describe('.isValidUrl', () => {
    urls.forEach(url => {
      it(url, () => {
        should(isValidUrl({ url })).be.true()
      })
    })
  })

  describe('iframe', () => {
    urls.forEach(url => {
      it(url, async () => {
        const metascraper = createMetascraper([createMetascraperIframe()])
        const meta = await metascraper({ url, escape: false })
        should(meta.iframe).be.not.null()
      })
    })
  })
})
