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
  require('metascraper-manifest')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-readability')()
])

const url =
  'https://bykvu.com/ru/bukvy/107312-ukraina-budet-uvazhat-religioznyj-vybor-kazhdogo-grazhdanina-poroshenko/'

it('bukvy', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
