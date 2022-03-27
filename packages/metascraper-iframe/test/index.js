'use strict'

const { readFile } = require('fs').promises
const { resolve } = require('path')
const should = require('should')
const cheerio = require('cheerio')

const createMetascraperIframe = require('..')

const { isValidUrl } = createMetascraperIframe

const { getOembedUrl } = require('../src/from-html')

const createMetascraper = (...args) =>
  require('metascraper')([createMetascraperIframe(...args)])

const commonProviders = [
  'https://www.youtube.com/watch?v=Gu8X7vM3Avw',
  'https://youtu.be/Gu8X7vM3Avw',
  'https://www.youtube.com/watch?v=-TWztwbOpog&list=PL5aqr5w5fRe4nO30px44D5sBukIUw1UwX',
  'https://open.spotify.com/track/63W11KVHDOpSlh3XMQ7qMg?si=Yd-hIkD9TtSUeFeR0jzKsA',
  'https://open.spotify.com/album/5ht7ItJgpBH7W6vJ5BqpPr',
  'https://vimeo.com/channels/staffpicks/135373919',
  'https://vimeo.com/135373919'
]

describe('metascraper-iframe', () => {
  describe('options', () => {
    it('gotOpts', async () => {
      const cache = new Map()
      const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
      const url = 'https://view.genial.ly/5dc53cfa759d2a0f4c7db5f4'
      const metascraper = createMetascraper({ gotOpts: { cache } })

      const metadataOne = await metascraper({
        url,
        html,
        iframe: { maxWidth: 350 }
      })

      should(!!metadataOne.iframe).be.true()

      const metadataTwo = await metascraper({
        url,
        html,
        iframe: { maxWidth: 500 }
      })

      should(!!metadataTwo.iframe).be.true()
      should(cache.size).be.equal(4)
    })

    it('iframe', async () => {
      const url = 'https://vimeo.com/135373919'
      const metascraper = createMetascraper()
      const metadata = await metascraper({ url, iframe: { maxWidth: 350 } })
      should(metadata.iframe.includes('width="350"')).be.true()
    })
  })

  describe('.test', () => {
    describe('from common providers', () => {
      describe('true', () => {
        commonProviders.forEach(url => {
          it(url, () => {
            const htmlDom = cheerio.load('')
            should(isValidUrl(url, htmlDom)).be.true()
          })
        })
      })

      describe('false', () => {
        ;['https://example.com'].forEach(url => {
          it(url, () => {
            const htmlDom = cheerio.load('')
            should(isValidUrl(url, htmlDom)).be.false()
          })
        })
      })
    })
    it('from markup', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
      const url = 'https://view.genial.ly/5dc53cfa759d2a0f4c7db5f4'
      const htmlDom = cheerio.load(html)
      should(isValidUrl(url, htmlDom)).be.true()
    })
  })

  describe('get iframe', () => {
    describe('from common providers', () => {
      commonProviders.forEach(url => {
        it(url, async () => {
          const metascraper = createMetascraper([createMetascraperIframe()])
          const metadata = await metascraper({ url })
          should(metadata.iframe).be.not.null()
        })
      })
    })

    it('from markup', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
      const url = 'https://view.genial.ly/5dc53cfa759d2a0f4c7db5f4'
      const rules = [createMetascraperIframe()]
      const metascraper = createMetascraper(rules)
      const metadata = await metascraper({ url, html })
      should(metadata.iframe).be.not.null()
    })

    it('from twitter player', async () => {
      const htmlWithDimensions = await readFile(
        resolve(__dirname, 'fixtures/indiehacker-with-dimensions.html')
      )

      const html = await readFile(
        resolve(__dirname, 'fixtures/indiehacker.html')
      )

      const url = 'https://share.transistor.fm/s/ddad295d'
      const rules = [createMetascraperIframe()]
      const metascraper = createMetascraper(rules)

      const iframe = (html, opts) =>
        metascraper({ url, html, iframe: opts }).then(data => data.iframe)

      should(await iframe(html, { maxWidth: 350 })).be.equal(
        '<iframe src="https://share.transistor.fm/e/ddad295d" frameborder="0" scrolling="no" maxWidth="350"></iframe>'
      )

      should(await iframe(htmlWithDimensions, { maxWidth: 350 })).be.equal(
        '<iframe src="https://share.transistor.fm/e/ddad295d" frameborder="0" scrolling="no" width="500" height="180" maxWidth="350"></iframe>'
      )
      should(
        await iframe(htmlWithDimensions, { maxWidth: 350, width: 100 })
      ).be.equal(
        '<iframe src="https://share.transistor.fm/e/ddad295d" frameborder="0" scrolling="no" width="100" height="180" maxWidth="350"></iframe>'
      )
    })
  })

  describe('.getOembedUrl', () => {
    it('detect from `application/json+oembed`', () => {
      const url = 'https://example.com'
      const oembedUrl = 'https://example.com'
      const html = `
      <!DOCTYPE html>
        <html lang="en">
        <head><link rel="alternate" type="application/json+oembed" href="${oembedUrl}"></head>
        <body></body>
      </html>
      `
      const jsonUrl = getOembedUrl(url, cheerio.load(html))
      should(jsonUrl).be.equal(`${oembedUrl}/`)
    })

    it('detect oEmbed URL from `text/xml+oembed`', () => {
      const url = 'https://example.com/'
      const html = `
      <!DOCTYPE html>
        <html lang="en">
        <head><link rel="alternate" type="text/xml+oembed" href="${url}"></head>
        <body></body>
      </html>
      `
      const jsonUrl = getOembedUrl(url, cheerio.load(html))
      should(jsonUrl).be.equal(url)
    })

    it('ensure output URL is absolute', () => {
      const oembedUrl = '/wp-json/oembed.js'
      const url = 'https://example.com'
      const html = `
      <!DOCTYPE html>
        <html lang="en">
        <head><link rel="alternate" type="text/xml+oembed" href="${oembedUrl}"></head>
        <body></body>
      </html>
      `
      const jsonUrl = getOembedUrl(url, cheerio.load(html))
      should(jsonUrl).be.equal(`${url}${oembedUrl}`)
    })
  })
})
