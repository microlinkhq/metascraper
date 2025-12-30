'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraperTiktok = require('../src/index.js')

const createMetascraper = () =>
  require('metascraper')([
    metascraperTiktok(),
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

test('from video post', async t => {
  const url = 'https://www.tiktok.com/@illojuan/video/7571863205253778710'
  const html = await readFile(resolve(__dirname, 'fixtures/video.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from profile', async t => {
  const url = 'https://www.tiktok.com/@illojuan'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  console.log(metadata)
  t.snapshot(metadata)
})
