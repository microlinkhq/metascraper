'use strict'

const { mapValues } = require('lodash')
const snapshot = require('snap-shot')
const kindOf = require('kind-of')
const should = require('should')

const metascraperSpotify = require('metascraper-spotify')

const { isValidUrl } = metascraperSpotify

const metascraper = require('metascraper')([
  metascraperSpotify(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const spotifyUrls = [
  'https://embed.spotify.com/?uri=spotify:track:5nTtCOCds6I0PHMNtqelas',
  'https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas',
  'https://open.spotify.com/track/6YqroNoDYeQAOUMpdmim9M?si=_-aA_80kSligZ0SN6VsboA',
  'https://play.spotify.com/track/4th1RQAelzqgY7wL53UGQt'
]

describe('metascraper-spotify', () => {
  describe('.isvalidUrl', () => {
    spotifyUrls.forEach(url => {
      it(url, () => {
        should(isValidUrl(url)).be.true()
      })
    })
  })

  describe('extract metadata', () => {
    spotifyUrls.forEach(url => {
      it(url, async () => {
        const meta = await metascraper({ url })
        snapshot(mapValues(meta, kindOf))
      })
    })
  })
})
