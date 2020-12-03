'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')

const metascraper = require('metascraper')([
  require('metascraper-telegram')(),
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

// TODO: Add date support
describe('metascraper-telegram', () => {
  it('post with little image', async () => {
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-right-preview.html')
    )
    const url = 'https://t.me/teslahunt/2351'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('post with big image', async () => {
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-full-image.html')
    )
    const url = 'https://t.me/sharingaway/76'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('post with an image inside a link', async () => {
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-link-image.html')
    )
    const url = 'https://t.me/sharingaway/73'
    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })
})
