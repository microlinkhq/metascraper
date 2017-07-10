'use strict'

const {load: loadJSON} = require('json-future')
const {resolve} = require('path')
const {promisify} = require('util')
const should = require('should')
const fs = require('fs')

const getMetaData = require('../../..')
const readFile = promisify(fs.readFile)
const url = 'https://www.startupgrind.com/blog/tech-funding-is-officialy-slowing-down-3-ways-to-survive-the-cooling/'

it('startup-grind', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const json = await loadJSON(resolve(__dirname, 'output.json'))
  const metadata = await getMetaData({html, url})
  should(metadata).be.eql(json)
})
