'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:bench:twitter:get-guest-token'
)

const { createGuestToken } = require('../../../src/get-media/provider/twitter')

const opts = require('../../constants')

const getGuestToken = createGuestToken(opts)

// When it reaches the max, it returns a 429 rate limit error
const mainLoop = async () => {
  let n = 0
  while (true) {
    try {
      const guestToken = await getGuestToken()
      debug({ n: ++n, guestToken })
    } catch (err) {
      console.error('ERR', err)
    }
  }
}

mainLoop()
