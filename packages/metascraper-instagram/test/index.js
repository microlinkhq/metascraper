'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')

const metascraper = require('metascraper')([
  require('metascraper-instagram')(),
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

describe('metascraper-instagram', () => {
  it('from photo post', async () => {
    const url = 'https://www.instagram.com/p/CPeC-Eenc8l/'
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-with-photo.html')
    )
    const metadata = await metascraper({ url, html })
    snapshot(metadata)
  })
  it('from multi photo post', async () => {
    const url = 'https://www.instagram.com/p/COn3M4TnRi1/'
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-with-multi-photo.html')
    )
    const metadata = await metascraper({ url, html })
    snapshot(metadata)
  })
  it('from video post', async () => {
    const url = 'https://www.instagram.com/p/CPQjO5RIIO9/'
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-with-video.html')
    )
    const metadata = await metascraper({ url, html })
    snapshot(metadata)
  })
  it('from clip post', async () => {
    const url = 'https://www.instagram.com/p/CN2VQ1yI_MA/'
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-with-clip.html')
    )
    const metadata = await metascraper({ url, html })
    snapshot(metadata)
  })
  it('from igtv', async () => {
    const url = 'https://www.instagram.com/p/CIoLRFIIL50/'
    const html = await readFile(
      resolve(__dirname, 'fixtures/post-with-igtv.html')
    )
    const metadata = await metascraper({ url, html })
    snapshot(metadata)
  })
})
