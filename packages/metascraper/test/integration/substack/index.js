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
  t.is(typeof date, 'string')
  t.is(logo, null)
  t.snapshot(metadata)
})
