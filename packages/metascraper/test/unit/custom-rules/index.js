'use strict'

const clearModule = require('clear-module')
const should = require('should')

describe('custom rules', () => {
  before(clearModule.all)
  after(clearModule.all)

  it('loading custom rules', async () => {
    process.env.METASCRAPER_CONFIG_CWD = __dirname
    const metascraper = require('../../..')

    const url = 'https://facebook.com'
    const html = '<div></div>'
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://logo.clearbit.com/facebook.com?size=128&format=jpg'
    )
  })
})
