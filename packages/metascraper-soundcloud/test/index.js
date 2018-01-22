'use strict'

const clearModule = require('clear-module')
const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')
const fs = require('fs')

const readFile = promisify(fs.readFile)

let metascraper

describe('metascraper-soundcloud', () => {
  before(() => {
    clearModule('metascraper')
    process.env.METASCRAPER_CWD = __dirname
    metascraper = require('metascraper')
  })

  after(() => {
    clearModule('metascraper')
    delete process.env.METASCRAPER_CWD
  })

  it('song', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/song.html'))
    const url = 'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'

    const metadata = await metascraper({ html, url })
    snapshot(metadata)
  })
})
