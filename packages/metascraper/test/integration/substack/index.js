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
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-readability')(),
  require('metascraper-audio')()
])

const url =
  'https://simonsarris.substack.com/p/the-most-precious-resource-is-agency'

test('substack', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const { date, logo, ...metadata } = await metascraper({ html, url })
  t.snapshot(metadata)
  t.is(typeof date, 'string')
  t.true(logo.includes('gstatic'))
})
