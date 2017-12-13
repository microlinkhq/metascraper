'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const metascraper = require('../../..')()
const readFile = promisify(fs.readFile)

const url =
  'http://www.prnewswire.com/news-releases/hackerrank--cybermedia-technologies-partner-to-help-close-the-stem-skills-gap-in-federal-government-300256929.html'

it('pr-newswire', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  snapshot(metadata)
})
