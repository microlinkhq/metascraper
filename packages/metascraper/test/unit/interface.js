'use strict'

const should = require('should')

const metascraper = require('../..')

it('url is required', async () => {
  try {
    await metascraper()
  } catch (err) {
    should(err).instanceof(TypeError)
  }
})

it('html is required', async () => {
  try {
    await metascraper({ url: 'https://foo.com' })
  } catch (err) {
    should(err).instanceof(TypeError)
  }
})
