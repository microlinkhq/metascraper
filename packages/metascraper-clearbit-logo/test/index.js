'use strict'

const should = require('should')

const clearbitLogo = require('..')()

describe('metascraper clearbit logo', () => {
  it('propName is logo', () => {
    should(clearbitLogo.propName).be.equal('logo')
  })

  it('if logo is present, not do nothing', () => {
    const url = 'https://facebook.com'
    const meta = { logo: 'https://facebook.com/logo.png' }
    const data = clearbitLogo[0]({ url, meta })
    should(data).be.undefined()
  })

  it('if logo is not present, fallback to clearbit logo API', () => {
    const url = 'https://facebook.com'
    const meta = { logo: 'https://facebook.com/favicon.ico' }
    const data = clearbitLogo[0]({ url, meta })
    should(data).be.equal(
      'https://logo.clearbit.com/facebook.com?size=128&format=png'
    )
  })
})
