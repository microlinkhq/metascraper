'use strict'

const should = require('should')

const getMetaData = require('../..')

describe('required options', () => {
  it('url', async () => {
    try {
      await getMetaData()
    } catch (err) {
      should(err).instanceof(TypeError)
    }
  })

  it('html', async () => {
    try {
      await getMetaData({ url: 'https://foo.com' })
    } catch (err) {
      should(err).instanceof(TypeError)
    }
  })
})
