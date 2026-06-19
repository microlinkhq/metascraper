'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava').default

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
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-readability')(),
  require('metascraper-audio')()
])

const url = 'https://share.transistor.fm/e/70c487ed'

test('transistor.fm', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const { logo, ...metadata } = await metascraper({ html, url })
  t.snapshot(metadata)
  t.true(
    logo === null || (typeof logo === 'string' && /^https?:\/\//.test(logo)),
    String(logo)
  )
})
