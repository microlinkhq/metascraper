'use strict'

const fs = require('fs')
const path = require('path')
const {template} = require('lodash')
const multiline = require('multiline')

const dirs = fs.readdirSync('./')

const createIndex = template(multiline(function () { /*
'use strict'

const snapshot = require('snap-shot')
const {promisify} = require('util')
const {resolve} = require('path')

const fs = require('fs')

const getMetaData = require('../../..')
const readFile = promisify(fs.readFile)

const url = '<%= url %>'

it('<%= name %>', async () => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await getMetaData({html, url})
  snapshot(metadata)
})

*/ }))

dirs.forEach(dir => {
  try {
    const testPath = path.resolve(dir)
    const {url} = require(path.resolve(testPath, 'output.json'))
    const indexFile = createIndex({name: dir, url})
    fs.writeFileSync(path.resolve(testPath, 'index.js'), indexFile)
    fs.unlinkSync(path.resolve(testPath, 'output.json'))
    // const index = createIndex(url)
    // console.log(index)
  } catch (err) {
    // console.log(err)
  }
})
