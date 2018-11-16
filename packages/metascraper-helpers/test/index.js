'use strict'

const should = require('should')

const { extension, absoluteUrl } = require('../')

describe('metascraper-helpers', () => {
  it('.absoluteUrl', () => {
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

  it('.extension', () => {
    should(extension('.mp4')).be.equal('mp4')
    should(extension('.mp4#t=0')).be.equal('mp4')
    should(extension('.mp4?foo=bar')).be.equal('mp4')
    should(extension('.mp4?foo=bar#t=0')).be.equal('mp4')
  })
})
