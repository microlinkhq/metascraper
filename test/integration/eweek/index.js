'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const metascraper = require('../../..')()
const readFile = promisify(fs.readFile)

const url =
  'http://www.eweek.com/developer/microsoft-hackerrank-launch-bing-search-tool-for-programmers.html'

it('eweek', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
