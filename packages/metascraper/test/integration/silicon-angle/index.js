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
  'http://siliconangle.com/blog/2016/05/16/circleci-receives-18-million-in-series-b-funding-round-with-scale-venture-partners'

it('silicon-angle', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
