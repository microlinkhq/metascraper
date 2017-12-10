'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const getMetaData = require('../../..')
const readFile = promisify(fs.readFile)

const url =
  'http://www.cnet.com/news/pebble-2-pebble-time-2-pebble-core-announced-coming-this-year-and-2017'

it('cnet', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await getMetaData({ html, url })
  snapshot(metadata)
})
