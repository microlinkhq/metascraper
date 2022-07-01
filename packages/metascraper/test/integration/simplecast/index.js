'use strict'

const { readFile } = require('fs').promises
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
  'https://player.simplecast.com/3ab2ec74-8d89-4344-9be0-a30fa53ac6a7?dark=false'

test('simplecast', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const { date, ...metadata } = await metascraper({ html, url })
  t.is(typeof date, 'string')
  t.snapshot(metadata)
})
