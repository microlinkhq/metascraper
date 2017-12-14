'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const metascraper = require('../../..')
const readFile = promisify(fs.readFile)

const url =
  'https://audiense.com/twin-peaks-2017-using-the-social-data-audience-consumer-insights-to-create-the-next-big-tv-sensation'

it('audiense', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
