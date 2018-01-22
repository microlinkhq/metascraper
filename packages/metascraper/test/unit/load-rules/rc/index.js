'use strict'

const clearModule = require('clear-module')
const should = require('should')

let metascraper

describe('load rules', () => {
  before(() => {
    clearModule.all()
    process.env.METASCRAPER_CWD = __dirname
    metascraper = require('../../../..')
  })

  after(() => {
    clearModule.all()
    delete process.env.METASCRAPER_CWD
  })

  it('based on a rc file', async () => {
    const url = 'https://facebook.com'
    const html = '<div></div>'

    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://logo.clearbit.com/facebook.com?size=128&format=jpg'
    )
  })
})
