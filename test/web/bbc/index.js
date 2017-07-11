'use strict'

const {load: loadJSON} = require('json-future')
const {resolve} = require('path')
const {promisify} = require('util')
const should = require('should')
const fs = require('fs')

const getMetaData = require('../../..')
const readFile = promisify(fs.readFile)

it('bbc', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const json = await loadJSON(resolve(__dirname, 'output.json'))
  const metadata = await getMetaData({html})
  should(metadata).be.eql(json)
})
