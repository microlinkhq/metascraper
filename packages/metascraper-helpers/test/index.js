'use strict'

const should = require('should')

const { absoluteUrl } = require('../')

describe('metascraper-helpers', () => {
  it('absoluteUrl', () => {
    should(absoluteUrl('https://kikobeats.com/', 'blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(absoluteUrl('https://kikobeats.com', '/blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(absoluteUrl('https://kikobeats.com/', '/blog')).be.equal(
      'https://kikobeats.com/blog'
    )
    should(absoluteUrl('http://kikobeats.com/', '/blog')).be.equal(
      'http://kikobeats.com/blog'
    )
  })
})
