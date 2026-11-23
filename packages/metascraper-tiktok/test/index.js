'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava').default

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

test('from video post without open graph', async t => {
  const url = 'https://www.tiktok.com/@msnow/video/7685447773642083597'
  const html = await readFile(resolve(__dirname, 'fixtures/video-pwa.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from profile', async t => {
  const url = 'https://www.tiktok.com/@illojuan'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('fallback date extraction when video id is invalid', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/video.html'))
  const metascraper = createMetascraper()

  const metadata = await metascraper({
    url: 'https://www.tiktok.com/@illojuan/video/not-a-number',
    html
  })

  t.truthy(metadata.date)
})

test('a second document at the same url is read on its own', async t => {
  const url = 'https://www.tiktok.com/@someone/video/1'
  const page = name =>
    `<html><head><meta property="og:title" content="${name} on TikTok"></head><body></body></html>`
  const metascraper = createMetascraper()

  const first = await metascraper({ url, html: page('First Author') })
  const second = await metascraper({ url, html: page('Second Author') })

  t.is(first.author, 'First Author')
  t.is(second.author, 'Second Author')
})
