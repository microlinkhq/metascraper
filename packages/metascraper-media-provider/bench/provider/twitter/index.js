'use strict'

const timeSpan = require('@kikobeats/time-span')({
  format: require('pretty-ms')
})
const debug = require('debug-logfmt')(
  'metascraper-media-provider:bench:twitter'
)

const {
  createGuestToken,
  createGetTwitterVideo
} = require('../../../src/get-media/provider/twitter')

const { getUrl, ...opts } = require('../../constants')

const getGuestToken = createGuestToken(opts)
const twitterVideo = createGetTwitterVideo({ ...opts, getGuestToken })

const mainLoop = async () => {
  let n = 0
  let error = false
  while (!error) {
    try {
      const duration = timeSpan()
      const data = await twitterVideo(getUrl())
      const hasVideo = data && data.formats && data.formats.length > 0

      debug({ n: n++, hasVideo, duration: duration() })

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
