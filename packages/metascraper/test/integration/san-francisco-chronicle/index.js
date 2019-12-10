'use strict'

const snapshot = require('snap-shot')
const { resolve } = require('path')
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
  require('metascraper-readability')()
])

const url =
  'http://www.sfchronicle.com/business/article/Nasdaq-center-in-SF-offers-free-classes-for-7338290.php'

it('san-francisco-chronicle', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
