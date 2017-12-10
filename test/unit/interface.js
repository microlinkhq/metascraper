'use strict'

const should = require('should')

const getMetaData = require('../..')

it('url is required', async () => {
  try {
    await getMetaData()
  } catch (err) {
    should(err).instanceof(TypeError)
  }
})

it('html is required', async () => {
  try {
    await getMetaData({ url: 'https://foo.com' })
  } catch (err) {
    should(err).instanceof(TypeError)
  }
})
