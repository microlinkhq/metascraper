'use strict'

const clearModule = require('clear-module')
const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
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

  it('works with product url', async () => {
    const metascraper = require('metascraper')
    const html = await readFile(resolve(__dirname, 'fixtures/product-url.html'))
    const url = 'https://www.amazon.com/gp/product/B0057OC5O8/'
    const meta = await metascraper({ html, url })
    snapshot(meta)
  })
})
