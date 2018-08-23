'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const { omit } = require('lodash')
const fs = require('fs')

const metascraper = require('metascraper')([
  require('metascraper-youtube')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const readFile = promisify(fs.readFile)

describe('metascraper-youtube', () => {
  describe('urls', () => {
    it('youtube video', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/youtube-video.html')
      )
      const url = 'https://www.youtube.com/watch?v=hwMkbaS_M_c'

      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })

    it('youtube video old', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/youtube-video-old.html')
      )
      const url = 'https://www.youtube.com/watch?v=GDRd-BFTYIg'

      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })

    it('youtube channel', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/youtube-channel.html')
      )
      const url = 'https://www.youtube.com/channel/UCzcRQ3vRNr6fJ1A9rqFn7QA'

      const metadata = omit(await metascraper({ html, url }), ['date'])
      snapshot(metadata)
    })
  })

  describe('image size', () => {
    it('get the high image size', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/image-size.html')
      )
      const url = 'https://www.youtube.com/watch?v=rXyKq7izYCQ'
      const metadata = omit(await metascraper({ html, url }), ['date'])
      snapshot(metadata)
    })
  })
})
