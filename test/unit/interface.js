'use strict'

const should = require('should')

const createMetascraper = require('../..')
const clearbitLogo = require('metascraper-clearbit-logo')()

it('url is required', async () => {
  const metascraper = createMetascraper()
  try {
    await metascraper()
  } catch (err) {
    should(err).instanceof(TypeError)
  }
})

it('html is required', async () => {
  const metascraper = createMetascraper()
  try {
    await metascraper({ url: 'https://foo.com' })
  } catch (err) {
    should(err).instanceof(TypeError)
  }
})

it('plugins support', async () => {
  const metascraper = createMetascraper({ plugins: [clearbitLogo] })
  const url = 'https://facebook.com'
  const html = '<div></div>'
  const meta = await metascraper({ url, html })
  should(meta.logo).be.equal(
    'https://logo.clearbit.com/facebook.com?size=128&format=png'
  )
})
