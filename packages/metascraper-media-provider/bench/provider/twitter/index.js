'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:bench:twitter'
)
const prettyMs = require('pretty-ms')
const timeSpan = require('time-span')

const {
  createGuestToken,
  createGetTwitterVideo
} = require('../../../src/get-media/provider/twitter')

const uniqueRandomArray = require('unique-random-array')
const userAgent = require('ua-string')

const { getProxy, urls } = require('../../constants')

const getUrl = uniqueRandomArray(urls)
const getGuestToken = createGuestToken({ userAgent, getProxy })
const twitterVideo = createGetTwitterVideo({ userAgent, getGuestToken })

const mainLoop = async () => {
  let n = 0
  let error = false
  while (!error) {
    try {
      const end = timeSpan()
      const data = await twitterVideo(getUrl())
      const hasVideo = data && data.formats && data.formats.length > 0

      debug({ n: n++, hasVideo, time: prettyMs(end()) })

      if (!hasVideo) {
        const err = new Error('No video detected!')
        err.data = data
        throw err
      }
    } catch (err) {
      error = err
    }
  }

  console.log('ERR!')
  console.log(error)
  console.log(error.data)
}

mainLoop()
