'use strict'

const should = require('should')

const metascraper = require('metascraper')([require('..')()])

describe('metascraper-clearbit-logo', () => {
  it('returns when is possible resolve logo', async () => {
    const url = 'https://facebook.com'
    const meta = await metascraper({ url })
    should(meta.logo.indexOf('clearbit') !== -1).be.true()
  })

  it('otherwise returns null', async () => {
    const url = 'https://lolwerhere.com'
    const html = '<div></div>'
    const meta = await metascraper({ html, url })
    should(meta.logo).be.null()
  })
})
