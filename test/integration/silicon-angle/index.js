'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const metascraper = require('../../..')()
const readFile = promisify(fs.readFile)

const url =
  'http://siliconangle.com/blog/2016/05/16/circleci-receives-18-million-in-series-b-funding-round-with-scale-venture-partners'

it('silicon-angle', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
