'use strict'

const snapshot = require('snap-shot')

const metascraper = require('metascraper').load([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

describe('metascraper-clearbit-logo', () => {
  it('if logo is not present, fallback to clearbit logo API', async () => {
    const url = 'https://facebook.com'
    const html = '<div></div>'
    const meta = await metascraper({ html, url })
    snapshot(meta)
  })
})
