'use strict'

const { mapValues } = require('lodash')
const kindOf = require('kind-of')
const test = require('ava')

const { spotifyUrls } = require('./helpers')

const metascraperSpotify = require('metascraper-spotify')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperSpotify(...args),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-lang')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

test('provide `keyvOpts`', async t => {
  const cache = new Map()
  const metascraper = createMetascraper({ keyvOpts: { store: cache } })

  const metadataOne = await metascraper({
    url: 'https://open.spotify.com/playlist/0Lt5S4hGarhtZmtz7BNTeX'
  })

  t.truthy(metadataOne.audio)
  t.is(cache.size, 1)

  const metadataTwo = await metascraper({
    url: 'https://open.spotify.com/playlist/1232353464563'
  })

  t.falsy(metadataTwo.audio)
  t.is(cache.size, 2)
})

spotifyUrls.forEach(url => {
  test(url, async t => {
    const metascraper = createMetascraper()
    const metadata = await metascraper({ url })
    t.snapshot(mapValues(metadata, kindOf))
  })
})
