'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraperTwitter = require('metascraper-twitter')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperTwitter(...args),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-lang')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

test('from a Twitter profile', async t => {
  const url = 'https://twitter.com/Kikobeats'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))

  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })

  t.snapshot(metadata)
})

test('from a Twitter profile with tweets with video', async t => {
  const url = 'https://twitter.com/k4rliky'
  const html = await readFile(resolve(__dirname, 'fixtures/profile-video.html'))

  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })

  t.snapshot(metadata)
})

test('from a tweet', async t => {
  const url = 'https://twitter.com/realDonaldTrump/status/1222907250383245320'
  const html = await readFile(resolve(__dirname, 'fixtures/tweet.html'))

  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })

  t.snapshot(metadata)
})

test('from a tweet with a gif', async t => {
  const url = 'https://twitter.com/Kikobeats/status/880139124791029763'
  const html = await readFile(resolve(__dirname, 'fixtures/tweet-gif.html'))

  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })

  t.snapshot(metadata)
})

test('from a tweet with an image', async t => {
  const url = 'https://twitter.com/k4rliky/status/934482867480121345'
  const html = await readFile(resolve(__dirname, 'fixtures/tweet-image.html'))

  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })

  t.snapshot(metadata)
})
