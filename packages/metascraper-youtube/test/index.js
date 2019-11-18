'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')
const { omit } = require('lodash')
const should = require('should')

const metascraperYoutube = require('metascraper-youtube')

const { isValidUrl } = metascraperYoutube

const metascraper = require('metascraper')([
  metascraperYoutube(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

describe('metascraper-youtube', () => {
  describe('.isvalidUrl', function () {
    it('true', () => {
      should(
        isValidUrl({ url: 'https://www.youtube.com/watch?v=hwMkbaS_M_c' })
      ).be.true()
      should(
        isValidUrl({ url: 'https://www.youtube.com/watch?v=GDRd-BFTYIg' })
      ).be.true()
      should(
        isValidUrl({
          url: 'https://www.youtube.com/channel/UCzcRQ3vRNr6fJ1A9rqFn7QA'
        })
      ).be.true()
      should(
        isValidUrl({ url: 'https://www.youtube.com/watch?v=rXyKq7izYCQ' })
      ).be.true()
    })
    it('false', () => {
      should(isValidUrl({ url: 'https://microlink.io' })).be.false()
      should(isValidUrl({ url: 'https://kikobeats.com' })).be.false()
    })
  })

  describe('urls', () => {
    it('youtube video', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/youtube-video.html')
      )
      const url = 'https://www.youtube.com/watch?v=hwMkbaS_M_c'

      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })

    it('youtube video old', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/youtube-video-old.html')
      )
      const url = 'https://www.youtube.com/watch?v=GDRd-BFTYIg'

      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })

    it('youtube channel', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/youtube-channel.html')
      )
      const url = 'https://www.youtube.com/channel/UCzcRQ3vRNr6fJ1A9rqFn7QA'

      const metadata = omit(await metascraper({ html, url }), ['date'])
      snapshot(metadata)
    })
  })

  describe('image size', () => {
    it('get the high image size', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/image-size.html')
      )
      const url = 'https://www.youtube.com/watch?v=rXyKq7izYCQ'
      const metadata = omit(await metascraper({ html, url }), ['date'])
      snapshot(metadata)
    })
  })
})
