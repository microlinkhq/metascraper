'use strict'

const createFromGeneric = require('../src/get-media/provider/generic')

const { createTunnel } = require('../src/get-media/util')

const { proxies, urls } = require('./constants')

const getTunnel = createTunnel({ proxies })

const uniqueRandomArray = require('unique-random-array')
const userAgent = require('ua-string')

function onError (err, url) {
  // console.log(`url`, url)
  // console.log(`err`, err)
}

const fromGeneric = createFromGeneric({ getTunnel, onError, userAgent })
const getUrl = uniqueRandomArray(urls)

// When it reaches the max, it returns a 429 rate limit error
const mainLoop = async () => {
  let index = 0
  let error = false
  while (!error) {
    try {
      const media = await fromGeneric(getUrl())
      const hasMedia = !!media.extractor
      console.log(++index, 'media?', hasMedia)

      if (!hasMedia) {
        const err = new Error('No media detected!')
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
