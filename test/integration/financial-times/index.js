'use strict'

const snapshot = require('snap-shot')
const { promisify } = require('util')
const { resolve } = require('path')

const fs = require('fs')

const getMetaData = require('../../..')
const readFile = promisify(fs.readFile)

const url =
  'http://www.ft.com/cms/s/2/796d1220-475e-11e5-af2f-4d6e0e5eda22.html'

it('financial-times', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await getMetaData({ html, url })
  snapshot(metadata)
})
