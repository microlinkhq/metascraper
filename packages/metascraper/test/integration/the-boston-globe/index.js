'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const metascraper = require('../../..')
const readFile = promisify(fs.readFile)

const url =
  'https://www.bostonglobe.com/business/2016/05/03/women-tech-band-together-track-diversity-after-hours/mWL9Pte1lx34HXMqXhEY4H/story.html'

it('the-boston-globe', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
