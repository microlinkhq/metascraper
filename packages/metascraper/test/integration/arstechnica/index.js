'use strict'

const { readFile } = require('fs/promises')
const test = require('ava').default
const { resolve } = require('path')

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

const url =
  'https://arstechnica.com/features/2017/06/youtube-changed-my-life-a-pair-of-original-videostars-ponder-a-life-lived-online'

test('arstechnica', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const { logo, ...metadata } = await metascraper({ html, url })
  t.true(logo === null || typeof logo === 'string')
  t.snapshot(metadata)
})
