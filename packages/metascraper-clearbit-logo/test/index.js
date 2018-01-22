'use strict'

const clearModule = require('clear-module')
const snapshot = require('snap-shot')

let metascraper

describe('metascraper-clearbit-logo', () => {
  before(() => {
    clearModule.all()
    process.env.METASCRAPER_CWD = __dirname
    metascraper = require('metascraper')
  })

  after(() => {
    clearModule.all()
    delete process.env.METASCRAPER_CWD
  })

  it('if logo is not present, fallback to clearbit logo API', async () => {
    const url = 'https://facebook.com'
    const html = '<div></div>'
    const meta = await metascraper({ html, url })
    snapshot(meta)
  })
})
