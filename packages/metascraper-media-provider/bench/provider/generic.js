'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:bench:generic'
)
const timeSpan = require('time-span')
const prettyMs = require('pretty-ms')

const createFromGeneric = require('../../src/get-media/provider/generic')
const { getUrl, ...opts } = require('../constants')

const fromGeneric = createFromGeneric(opts)

// When it reaches the max, it returns a 429 rate limit error
const mainLoop = async () => {
  let n = 0
  let error = false
  while (!error) {
    try {
      const end = timeSpan()
      const url = getUrl()
      const media = await fromGeneric(getUrl())
      const hasMedia = !!media && !!media.extractor

      debug({ n: n++, hasMedia, time: prettyMs(end()) })

      if (!hasMedia) {
        const err = new Error(`No media detected for '${url}'`)
        throw err
      }
    } catch (err) {
      error = err
    }
  }

  console.log('ERR!')
  console.log(error)
  console.log(error.data)
  process.exit(1)
}

mainLoop()
