'use strict'

const should = require('should')

const metascraper = require('metascraper')([require('..')()])
const { apiUrl } = require('..')

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

  it('compose urls using opts params', () => {
    should(apiUrl('https://facebook.com')).be.equal(
      'https://logo.clearbit.com/facebook.com'
    )
    should(apiUrl('https://facebook.com', { format: 'png' })).be.equal(
      'https://logo.clearbit.com/facebook.com?format=png'
    )
    should(apiUrl('https://facebook.com', { greyscale: false })).be.equal(
      'https://logo.clearbit.com/facebook.com?greyscale=false'
    )
  })
})
