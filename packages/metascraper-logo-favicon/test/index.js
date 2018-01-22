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
    process.env.METASCRAPER_CWD = __dirname
  })

  after(() => {
    clearModule.all()
    delete process.env.METASCRAPER_CWD
  })

  describe('metascraper logo favicon', () => {
    it('create an absolute faivcon url if the logo is not present', async () => {
      const metascraper = require('metascraper')
      const html = await readFile(resolve(__dirname, 'fixtures/input.html'))
      const url = 'https://www.amazon.co.uk/Vegetable-Perfection-tasty-recipes-shoots/dp/1849757097/ref=asap_bc?ie=UTF8'
      const meta = omit(await metascraper({ html, url }), ['date'])
      snapshot(meta)
    })
  })
})
