'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')

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
  'http://www.anandtech.com/show/11591/amd-launches-ryzen-pro-cpus-enhanced-security-longer-warranty-better-quality'

it('anandtech', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
