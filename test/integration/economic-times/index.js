'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const metascraper = require('../../..')()
const readFile = promisify(fs.readFile)

const url =
  'http://economictimes.indiatimes.com/jobs/hackerrank-launches-job-search-platform-hackerrank-jobs/articleshow/50551900.cms'

it('economic-times', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
