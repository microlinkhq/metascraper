'use strict'

const { readFile } = require('fs').promises
const { resolve } = require('path')
const should = require('should')
const cheerio = require('cheerio')

const createMetascraperIframe = require('..')
const createMetascraper = require('metascraper')

const { test } = createMetascraperIframe

const { getOembedUrl } = require('../src/from-html')

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
  describe('.test', () => {
    describe('from common providers', () => {
      commonProviders.forEach(url => {
        it(url, () => {
          const htmlDom = cheerio.load('')
          const isValid = test({ url, htmlDom })
          should(isValid).be.true()
        })
      })
    })
    it('from markup', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
      const url = 'https://view.genial.ly/5dc53cfa759d2a0f4c7db5f4'
      const htmlDom = cheerio.load(html)
      const isValid = test({ url, htmlDom })
      should(isValid).be.true()
    })
  })

  describe('get iframe', () => {
    describe('from common providers', () => {
      commonProviders.forEach(url => {
        it(url, async () => {
          const metascraper = createMetascraper([createMetascraperIframe()])
          const meta = await metascraper({ url })
          should(meta.iframe).be.not.null()
        })
      })
    })
    it('from markup', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
      const url = 'https://view.genial.ly/5dc53cfa759d2a0f4c7db5f4'
      const rules = [createMetascraperIframe()]
      const metascraper = createMetascraper(rules)
      const meta = await metascraper({ url, html })
      should(meta.iframe).be.not.null()
    })
  })

  describe('opts', () => {
    it('pass custom got options', async () => {
      const cache = new Map()
      const gotOpts = { cache }

      const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
      const url = 'https://view.genial.ly/5dc53cfa759d2a0f4c7db5f4'

      const rules = [createMetascraperIframe({ gotOpts })]
      const metascraper = createMetascraper(rules)
      const meta = await metascraper({ url, html })
      should(meta.iframe).be.not.null()
      should(cache.size).be.equal(1)
    })

    it('pass iframe options', async () => {
      const url = 'https://vimeo.com/135373919'

      const rules = [createMetascraperIframe()]
      const metascraper = createMetascraper(rules)

      should(
        (await metascraper({ url, iframe: { maxWidth: 350 } })).iframe.includes(
          'width="350"'
        )
      ).be.true()

      should(
        (await metascraper({ url, iframe: { maxWidth: 350 } })).iframe.includes(
          'width="350"'
        )
      ).be.true()
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
      should(jsonUrl).be.equal(oembedUrl)
    })

    it('detect oEmbed URL from `text/xml+oembed`', () => {
      const url = 'https://example.com/'
      const oembedUrl = 'https://example.com'
      const html = `
      <!DOCTYPE html>
        <html lang="en">
        <head><link rel="alternate" type="text/xml+oembed" href="${oembedUrl}"></head>
        <body></body>
      </html>
      `
      const jsonUrl = getOembedUrl(url, cheerio.load(html))
      should(jsonUrl).be.equal(oembedUrl)
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
