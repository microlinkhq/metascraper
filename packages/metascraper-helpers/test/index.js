'use strict'

const should = require('should')

const { getAbsoluteUrl } = require('../')

describe('metascraper-helpers', () => {
  it('getAbsoluteUrl', () => {
    should(getAbsoluteUrl('https://kikobeats.com/', 'blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(getAbsoluteUrl('https://kikobeats.com', '/blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(getAbsoluteUrl('https://kikobeats.com/', '/blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(getAbsoluteUrl('http://kikobeats.com/', '/blog')).be.equal(
      'http://kikobeats.com/blog'
    )
  })
})
