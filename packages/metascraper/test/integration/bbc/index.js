'use strict'

const { readFile } = require('fs/promises')
const test = require('ava')
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

const url = 'http://www.bbc.com/news/business-40504764'

test('bbc', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const { logo, ...metadata } = await metascraper({ html, url })

  t.true(
    [
      'https://static.files.bbci.co.uk/core/website/assets/static/icons/touch/news/touch-icon-384.728e3a03d3b09148ade1.png',
      'https://static.files.bbci.co.uk/core/website/assets/static/icons/touch/news/touch-icon-512.685da29e9e8ce5e435a8.png'
    ].includes(logo),
    `Logo is not in the list: ${logo}`
  )

  t.snapshot(metadata)
})
