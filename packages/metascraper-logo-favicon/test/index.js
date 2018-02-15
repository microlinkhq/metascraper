'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const { omit } = require('lodash')
const fs = require('fs')

const metascraper = require('metascraper').load([
  require('metascraper-amazon')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const readFile = promisify(fs.readFile)

describe('metascraper-logo-favicon', () => {
  describe('metascraper logo favicon', () => {
    it('create an absolute faivcon url if the logo is not present', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/input.html'))
      const url = 'https://www.amazon.co.uk/Vegetable-Perfection-tasty-recipes-shoots/dp/1849757097/ref=asap_bc?ie=UTF8'
      const meta = omit(await metascraper({ html, url }), ['date'])
      snapshot(meta)
    })
  })
})
