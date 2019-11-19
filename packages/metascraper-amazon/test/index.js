'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')
const { omit } = require('lodash')
const should = require('should')

const metascraper = require('metascraper')([
  require('..')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

describe('metascraper-amazon', () => {
  describe('amazon.co.uk', () => {
    it('product url', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/amazon-co-uk/product-url.html')
      )
      const url =
        'https://www.amazon.co.uk/Vegetable-Perfection-tasty-recipes-shoots/dp/1849757097/ref=asap_bc?ie=UTF8'
      const metadata = omit(await metascraper({ html, url }), ['date'])
      snapshot(metadata)
    })
  })

  describe('amazon.com', () => {
    it('ansi url', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/amazon-com/ansi-url.html')
      )
      const url = 'https://www.amazon.com/gp/product/B0057OC5O8/'
      const metadata = await metascraper({ html, url })

      // omit date because it is non deterministic
      snapshot(omit(metadata, ['date']))
      should(metadata.date).instanceOf(String)
    })

    it('product url', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/amazon-com/product-url.html')
      )
      const url =
        'https://www.amazon.com/The-Whole-Truth-Shaw-Book-ebook/dp/B0011UCPM4/ref=pd_zg_rss_ts_b_17_6?ie=UTF8&tag=recomshop-22'
      const metadata = await metascraper({ html, url })

      // omit date because it is non deterministic
      snapshot(omit(metadata, ['date']))
      should(metadata.date).instanceOf(String)
    })
  })

  describe('amazon.es', () => {
    it('product url', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/amazon-es/product-url.html')
      )
      const url =
        'https://www.amazon.es/aspirador-Excellence-Programable-limpieza-Silencioso/dp/B01MUGXRT9'
      const metadata = await metascraper({ html, url })

      // omit date because it is non deterministic
      snapshot(omit(metadata, ['date']))
      should(metadata.date).instanceOf(String)
    })
  })
})
