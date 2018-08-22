'use strict'

const should = require('should')

const metascraper = require('metascraper')([
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
  it('returns when is possible resolve logo', async () => {
    const url = 'https://facebook.com'
    const html = '<div></div>'
    const meta = await metascraper({ html, url })
    should(meta.logo.indexOf('clearbit') !== -1).be.true()
  })

  it('otherwise returns null', async () => {
    const url = 'https://lolwerhere.com'
    const html = '<div></div>'
    const meta = await metascraper({ html, url })
    should(meta.logo).be.null()
  })
})
