'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraperReddit = require('metascraper-reddit')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperReddit(...args),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-image')(),
    require('metascraper-description')(),
    require('metascraper-lang')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

test('from a post', async t => {
  const url =
    'https://www.reddit.com/r/lotus/comments/1pzbv0z/my_lotus_elise_72d_with_17_rays_volk_gtp/'
  const html = await readFile(resolve(__dirname, 'fixtures/post.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})
