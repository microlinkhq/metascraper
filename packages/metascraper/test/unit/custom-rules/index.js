'use strict'

const should = require('should')
const metascraper = require('../../..')

it('loading custom rules', async () => {
  const url = 'https://facebook.com'
  const html = '<div></div>'
  const meta = await metascraper({ url, html })
  should(meta.logo).be.equal(
    'https://logo.clearbit.com/facebook.com?size=128&format=jpg'
  )
})
