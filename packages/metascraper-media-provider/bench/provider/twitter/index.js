'use strict'

const {
  createGuestToken,
  createGetTwitterVideo
} = require('../../../src/get-media/provider/twitter')
const { createTunnel } = require('../../../src/get-media/util')
const uniqueRandomArray = require('unique-random-array')
const userAgent = require('ua-string')

const { proxies, urls } = require('../../constants')

const getUrl = uniqueRandomArray(urls)
const tunnel = createTunnel(proxies)
const getGuestToken = createGuestToken({ userAgent, tunnel })
const twitterVideo = createGetTwitterVideo({ userAgent, getGuestToken })

const mainLoop = async () => {
  let index = 0
  let error = false
  while (!error) {
    try {
      const data = await twitterVideo(getUrl())
      const hasVideo = data && data.formats && data.formats.length > 0
      console.log(++index, 'video?', hasVideo)
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
