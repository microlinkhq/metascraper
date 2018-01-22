'use strict'

const clearModule = require('clear-module')
const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const fs = require('fs')

const readFile = promisify(fs.readFile)

let metascraper

describe('metascraper-youtube', () => {
  before(() => {
    clearModule('metascraper')
    process.env.METASCRAPER_CONFIG_CWD = __dirname
    metascraper = require('metascraper')
  })

  after(() => {
    clearModule('metascraper')
    delete process.env.METASCRAPER_CONFIG_CWD
  })

  it('youtube video', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/youtube-video.html'))
    const url = 'https://www.youtube.com/watch?v=hwMkbaS_M_c'

    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('youtube video old', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/youtube-video-old.html'))
    const url = 'https://www.youtube.com/watch?v=GDRd-BFTYIg'

    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })

  it('youtube channel', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/youtube-channel.html'))
    const url = 'https://www.youtube.com/channel/UCzcRQ3vRNr6fJ1A9rqFn7QA'

    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })
})
