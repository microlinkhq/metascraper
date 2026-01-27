'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraperBluesky = require('metascraper-bluesky')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperBluesky(...args),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-image')(),
    require('metascraper-description')(),
    require('metascraper-lang')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

test('from a profile', async t => {
  const url = 'https://bsky.app/profile/stephenking.bsky.social'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post', async t => {
  const url =
    'https://bsky.app/profile/stephenking.bsky.social/post/3mddvy5bv6k27'
  const html = await readFile(resolve(__dirname, 'fixtures/post.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with a link', async t => {
  const url = 'https://bsky.app/profile/forbes.com/post/3mdd7aj7pgs2x'
  const html = await readFile(resolve(__dirname, 'fixtures/post-link.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with an image', async t => {
  const url =
    'https://bsky.app/profile/glendunlap.bsky.social/post/3mdegyw3ves2t'
  const html = await readFile(resolve(__dirname, 'fixtures/post-image.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})
