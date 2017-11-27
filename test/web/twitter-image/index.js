'use strict'

const snapshot = require('snap-shot')
const {promisify} = require('util')
const {resolve} = require('path')

const fs = require('fs')

const getMetaData = require('../../..')
const readFile = promisify(fs.readFile)

const url = 'https://twitter.com/k4rliky/status/934482867480121345'

it('twitter', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await getMetaData({html, url})
  snapshot(metadata)
})
