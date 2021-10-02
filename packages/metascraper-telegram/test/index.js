'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')
const should = require('should')

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

describe('metascraper-telegram', () => {
  it('avoid non allowed URLs', async () => {
    const url = 'https://t.co/d0rwf2dLIp'
    const metadata = await metascraper({ url })
    should(metadata.audio).be.undefined()
  })

  it('avoid URLs with no iframe', async () => {
    const url = 'https://t.me/unlimitedhangout'
    const metadata = await metascraper({ url })
    should(metadata.audio).be.undefined()
  })

  it('post with little image', async () => {
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-right-preview.html')
    )
    const url = 'https://t.me/teslahunt/2351'
    const metadata = await metascraper({ html, url })
    const image = metadata.image

    delete metadata.image
    should(image.startsWith('https://cdn4')).be.true()
    snapshot(metadata)
  })

  it('post with big image', async () => {
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-full-image.html')
    )
    const url = 'https://t.me/chollometro/28542'
    const metadata = await metascraper({ html, url })
    const image = metadata.image

    delete metadata.image
    should(image.startsWith('https://cdn4')).be.true()
    snapshot(metadata)
  })

  it('post with an image inside a link', async () => {
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-link-image.html')
    )
    const url = 'https://t.me/teslahunt/15513'
    const metadata = await metascraper({ html, url })
    const image = metadata.image

    delete metadata.image
    should(image.startsWith('https://cdn4')).be.true()
    snapshot(metadata)
  })
})
