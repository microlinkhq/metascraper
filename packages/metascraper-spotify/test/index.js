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
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const spotifyUrls = [
  'https://open.spotify.com/album/7CjakTZxwIF8oixONe6Bpb',
  'https://open.spotify.com/artist/1gR0gsQYfi6joyO1dlp76N',
  'https://open.spotify.com/local/Yasunori+Mitsuda/Chrono+Trigger+OST/A+Shot+of+Crisis/161',
  'https://open.spotify.com/local/Yasunori+Mitsuda/Chrono+Trigger+OST+Disc+2/Ayla%27s+Theme/84',
  'https://open.spotify.com/search/artist%3ADaft+Punk',
  'https://open.spotify.com/track/4XfokvilxHAOQXfnWD9p0Q',
  'https://open.spotify.com/user/daftpunkofficial/playlist/6jP6EcvAwqNksccDkIe6hX',
  'https://open.spotify.com/user/hitradio%c3%b63',
  'https://open.spotify.com/user/hitradioö63',
  'https://open.spotify.com/user/syknyk/starred',
  'https://open.spotify.com/user/tootallnate',
  'https://open.spotify.com/user/tootallnate/playlist/0Lt5S4hGarhtZmtz7BNTeX',
  'https://open.spotify.com/user/tootallnate/starred',
  'https://embed.spotify.com/?uri=spotify:track:4XfokvilxHAOQXfnWD9p0Q',
  'https://open.spotify.com/embed/track/5oscsdDQ0NpjsTgpG4bI8S',
  'https://open.spotify.com/track/6YqroNoDYeQAOUMpdmim9M',
  'https://open.spotify.com/track/6YqroNoDYeQAOUMpdmim9M?si=_-aA_80kSligZ0SN6VsboA',
  'https://play.spotify.com/track/4XfokvilxHAOQXfnWD9p0Q',
  'https://open.spotify.com/episode/64TORH3xleuD1wcnFsrH1E'
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
