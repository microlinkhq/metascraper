'use strict'

const snapshot = require('snap-shot')
const { resolve } = require('path')
const { omit } = require('lodash')
const { readFile } = require('fs').promises

const metascraper = require('../../..')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
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

it('simplecast', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(omit(metadata, ['date']))
})
