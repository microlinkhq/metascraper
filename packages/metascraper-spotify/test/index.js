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
  'http://open.spotify.com/album/7CjakTZxwIF8oixONe6Bpb',
  'http://open.spotify.com/artist/1gR0gsQYfi6joyO1dlp76N',
  'http://open.spotify.com/local/Yasunori+Mitsuda/Chrono+Trigger+OST/A+Shot+of+Crisis/161',
  'http://open.spotify.com/local/Yasunori+Mitsuda/Chrono+Trigger+OST+Disc+2/Ayla%27s+Theme/84',
  'http://open.spotify.com/search/artist%3ADaft+Punk',
  'http://open.spotify.com/track/4XfokvilxHAOQXfnWD9p0Q',
  'http://open.spotify.com/user/daftpunkofficial/playlist/6jP6EcvAwqNksccDkIe6hX',
  'http://open.spotify.com/user/hitradio%c3%b63',
  'http://open.spotify.com/user/hitradioö63',
  'http://open.spotify.com/user/syknyk/starred',
  'http://open.spotify.com/user/tootallnate',
  'http://open.spotify.com/user/tootallnate/playlist/0Lt5S4hGarhtZmtz7BNTeX',
  'http://open.spotify.com/user/tootallnate/starred',
  'https://embed.spotify.com/?uri=spotify:track:4XfokvilxHAOQXfnWD9p0Q',
  'https://open.spotify.com/embed/track/5oscsdDQ0NpjsTgpG4bI8S',
  'https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas',
  'https://open.spotify.com/track/6YqroNoDYeQAOUMpdmim9M?si=_-aA_80kSligZ0SN6VsboA',
  'https://play.spotify.com/track/4XfokvilxHAOQXfnWD9p0Q'
]

describe('metascraper-spotify', () => {
  describe('.isvalidUrl', () => {
    describe('true', () => {
      spotifyUrls.forEach(url => {
        it(url, () => {
          should(isValidUrl(url)).be.true()
        })
      })
    })
    describe('false', () => {
      ;[
        'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
      ].forEach(url => {
        it(url, () => {
          should(isValidUrl(url)).be.false()
        })
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
