'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')

const metascraper = require('metascraper')([
  require('metascraper-soundcloud')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

describe('metascraper-soundcloud', () => {
  it('song', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/song.html'))
    const url =
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'

    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })
})
