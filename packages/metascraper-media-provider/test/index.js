'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const { omit } = require('lodash')
const fs = require('fs')

const metascraper = require('metascraper')([
  require('metascraper-publisher')(),
  require('..')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const readFile = promisify(fs.readFile)

const { getVideo } = require('..')

describe('metascraper-media-provider', () => {
  describe('.getVideo', () => {
    it('twitter', () => {
      snapshot(getVideo(require('./fixtures/video/twitter.json')))
    })
    it('vimeo', () => {
      snapshot(getVideo(require('./fixtures/video/vimeo.json')))
    })
    it('youtube', () => {
      snapshot(getVideo(require('./fixtures/video/youtube.json')))
    })
  })
  describe('provider', () => {
    it('vimeo', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/vimeo.html'))
      const url = 'https://vimeo.com/188175573'
      const metadata = await metascraper({ html, url })
      snapshot(omit(metadata, ['video']))
    })

    it('twitter', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/twitter.html'))
      const url = 'https://twitter.com/verge/status/957383241714970624'
      const metadata = await metascraper({ html, url })
      snapshot(omit(metadata, ['video']))
    })

    it('facebook', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/facebook.html'))
      const url = 'https://www.facebook.com/afcajax/videos/1686831701364171'
      const metadata = await metascraper({ html, url })
      snapshot(omit(metadata, ['video']))
    })

    it('youtube', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/youtube.html'))
      const url = 'https://www.youtube.com/watch?v=hwMkbaS_M_c'
      const metadata = await metascraper({ html, url })
      snapshot(omit(metadata, ['video']))
    })
  })
})
