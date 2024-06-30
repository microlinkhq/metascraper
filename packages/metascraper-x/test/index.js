'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraperX = require('metascraper-x')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperX(...args),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-image')(),
    require('metascraper-video')(),
    require('metascraper-description')(),
    require('metascraper-lang')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

test('from a X profile', async t => {
  const url = 'https://x.com/kikobeats?mx=2'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a X profile resolving URLs', async t => {
  const url = 'https://x.com/Kikobeats'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))

  const resolveUrl = async shortUrl => {
    const { url } = await fetch(shortUrl, { method: 'HEAD' })
    const urlObj = new URL(url)
    urlObj.search = ''
    return urlObj.toString().replace('https://', '').replace('/', '')
  }

  const metascraper = createMetascraper({ resolveUrls: true, resolveUrl })
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a X profile with tweets with video', async t => {
  const url = 'https://x.com/javilop'
  const html = await readFile(resolve(__dirname, 'fixtures/profile-video.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a tweet', async t => {
  const url = 'https://x.com/realDonaldTrump/status/1222907250383245320'
  const html = await readFile(resolve(__dirname, 'fixtures/tweet.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a tweet with a gif', async t => {
  const url = 'https://x.com/Kikobeats/status/880139124791029763'
  const html = await readFile(resolve(__dirname, 'fixtures/tweet-gif.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a tweet with an image', async t => {
  const url = 'https://x.com/UaSmart/status/934106870834454529'
  const html = await readFile(resolve(__dirname, 'fixtures/tweet-image.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})
