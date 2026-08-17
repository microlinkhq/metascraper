'use strict'

const { url: toUrl } = require('@metascraper/helpers')
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
  require('metascraper-manifest')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-readability')()
])

const url = 'https://blog.gardeviance.org/2024/02/a-good-enough-map.html'

test('blogger', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))

  const { logo, ...metadata } = await metascraper({ html, url })

  t.truthy(toUrl(logo))
  t.snapshot(metadata)
})
