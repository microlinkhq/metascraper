'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraper = require('../../..')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-audio')(),
  require('metascraper-video')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-manifest')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-readability')()
])

const url = 'https://fortune.com/2015/10/05/hackerrank-recruiting-tool/'

test('fortune', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, null)
  t.is(metadata.author, 'Kia Kokalitcheva')
  t.is(metadata.date, '2021-04-24T09:18:20.000Z')
  t.true(metadata.description.includes('HackerRank'))
  t.true(metadata.image.startsWith('https://content.fortune.com/'))
  t.is(metadata.lang, 'en')
  t.is(metadata.logo, 'https://fortune.com/icons/favicons/favicon.ico')
  t.is(metadata.publisher, 'Fortune')
  t.is(
    metadata.title,
    'Why your next job search may involve solving online puzzles'
  )
  t.is(metadata.url, url)
  t.true(
    metadata.video === null ||
      metadata.video.includes('video-files.fortune.com')
  )
})
