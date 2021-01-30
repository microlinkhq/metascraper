'use strict'

const snapshot = require('snap-shot')
const { resolve } = require('path')
const { readFile } = require('fs').promises

const metascraper = require('../../..')([
  require('metascraper-author')(),
  require('metascraper-audio')(),
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

it('nytimes (article)', async () => {
  const url =
    'https://www.nytimes.com/2017/07/03/smarter-living/how-to-see-what-the-internet-knows-about-you.html'
  const html = await readFile(resolve(__dirname, 'input/article.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})

it('nytimes (opinion)', async () => {
  const url =
    'https://www.nytimes.com/2020/11/19/opinion/sway-kara-swisher-raj-chetty.html'
  const html = await readFile(resolve(__dirname, 'input/opinion.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
