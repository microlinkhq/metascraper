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

const url =
  'https://jewishbusinessnews.com/2016/01/20/israeli-startup-jfrog-raises-50-million-in-c-round/'

test('jewish-business-news', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const { logo, ...metadata } = await metascraper({ html, url })
  t.snapshot(metadata)
  t.true(
    (typeof logo === 'string' &&
      new URL(logo).hostname.endsWith('.gstatic.com')) ||
      logo ===
        'https://i0.wp.com/jewishbusinessnews.com/wp-content/uploads/2021/08/cropped-favicon.jpg?fit=192%2C192&ssl=1',
    logo
  )
})
