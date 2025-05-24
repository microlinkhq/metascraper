'use strict'

const youtubedl = require('youtube-dl-exec')
const path = require('path')
const fs = require('fs/promises')

const { DEFAULT_FLAGS } = require('../../src/get-media')

let [, , url, filename] = process.argv

if (!url) throw new TypeError('process.argv[2] should be an url')
if (!filename) throw new TypeError('process.argv[3] should be a filename')
if (!filename.endsWith('.json')) filename += '.json'
;(async () => {
  const payload = await youtubedl(url, DEFAULT_FLAGS)
  const filepath = path.resolve(__dirname, 'provider', filename)
  await fs.writeFile(filepath, JSON.stringify(payload, null, 2))
  console.log('Done at', filepath, '✨')
})()
