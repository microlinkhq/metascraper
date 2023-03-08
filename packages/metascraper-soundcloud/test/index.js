'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

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

test('song', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/song.html'))
  const url = 'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'

  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})
