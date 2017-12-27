'use strict'

const clearModule = require('clear-module')
const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const { omit } = require('lodash')
const fs = require('fs')

const readFile = promisify(fs.readFile)

describe('metascraper amazon integration', () => {
  before(() => {
    clearModule.all()
    process.env.METASCRAPER_CONFIG_CWD = __dirname
  })

  after(() => {
    clearModule.all()
    delete process.env.METASCRAPER_CONFIG_CWD
  })

  describe('amazon.co.uk', () => {
    it('product url', async () => {
      const metascraper = require('metascraper')
      const html = await readFile(resolve(__dirname, 'fixtures/amazon-co-uk/product-url.html'))
      const url = 'https://www.amazon.co.uk/Vegetable-Perfection-tasty-recipes-shoots/dp/1849757097/ref=asap_bc?ie=UTF8'
      const meta = omit(await metascraper({ html, url }), ['date'])
      snapshot(meta)
    })
  })

  describe('amazon.com', () => {
    it('ansi url', async () => {
      const metascraper = require('metascraper')
      const html = await readFile(resolve(__dirname, 'fixtures/amazon-com/ansi-url.html'))
      const url = 'https://www.amazon.com/gp/product/B0057OC5O8/'
      const meta = omit(await metascraper({ html, url }), ['date'])
      snapshot(meta)
    })

    it('product url', async () => {
      const metascraper = require('metascraper')
      const html = await readFile(resolve(__dirname, 'fixtures/amazon-com/product-url.html'))
      const url = 'https://www.amazon.com/The-Whole-Truth-Shaw-Book-ebook/dp/B0011UCPM4/ref=pd_zg_rss_ts_b_17_6?ie=UTF8&tag=recomshop-22'
      const meta = omit(await metascraper({ html, url }), ['date'])
      snapshot(meta)
    })
  })

  describe('amazon.es', () => {
    it('product url', async () => {
      const metascraper = require('metascraper')
      const html = await readFile(resolve(__dirname, 'fixtures/amazon-es/product-url.html'))
      const url = 'https://www.amazon.es/aspirador-Excellence-Programable-limpieza-Silencioso/dp/B01MUGXRT9'
      const meta = omit(await metascraper({ html, url }), ['date'])
      snapshot(meta)
    })
  })
})
