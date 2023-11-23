'use strict'

const test = require('ava')

const {
  albumUrl,
  artistUrl,
  episodeUrl,
  fixtures,
  trackUrl
} = require('./helpers')

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

test('episode', async t => {
  const html = await fixtures[episodeUrl]()
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url: episodeUrl, html })

  t.is(
    metadata.description,
    'In this Hasty Treat, Scott and Wes talk about modules in Node — what are they, how they’re different from browser modules, and more! Sentry - Sponsor If you want to know what’s happening with your errors, track them with Sentry. Sentry is open-source error tracking that helps developers monitor and fix crashes in real time. Cut your time on error resolution from five hours to five minutes. It works with any language and integrates with dozens of other services. Syntax listeners can get two months for free by visiting Sentry.io and using the coupon code “tastytreat”. Show Notes 3:06 - How were they done before? 5:11 - How do they work? 7:07 - How to use Modules in Node 9:57 - Gotchas 13:18 - What should you use? Links Node Node Modules Babel ESM Meteor Keystone MJS Tweet us your tasty treats! Scott’s Instagram LevelUpTutorials Instagram Wes’ Instagram Wes’ Twitter Wes’ Facebook Scott’s Twitter Make sure to include @SyntaxFM in your tweets'
  )
})

test('artist', async t => {
  const html = await fixtures[artistUrl]()

  const metascraper = createMetascraper()
  const metadata = await metascraper({ url: artistUrl, html })

  t.is(metadata.description, 'Artist · 2.5M monthly listeners.')
})

test('album', async t => {
  const html = await fixtures[albumUrl]()

  const metascraper = createMetascraper()
  const metadata = await metascraper({ url: albumUrl, html })

  t.is(metadata.description, 'Justice · Album · 2012 · 14 songs.')
})

test('track', async t => {
  const html = await fixtures[trackUrl]()

  const metascraper = createMetascraper()
  const metadata = await metascraper({ url: trackUrl, html })

  t.is(metadata.description, 'Justice · Song · 2012')
})
