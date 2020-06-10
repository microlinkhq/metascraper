'use strict'

const { getDomainWithoutSuffix } = require('tldts')
const Agent = require('keepalive-proxy-agent')

const TEN_MIN_MS = 10 * 60 * 1000

const isTweet = url => url.includes('/status/')

const isTweetUrl = url =>
  isTweet(url) && getDomainWithoutSuffix(url) === 'twitter'

const getTweetId = url => url.split('/').reverse()[0]

const getAgent = proxy => {
  return proxy
    ? {
      https: new Agent({
        keepAlive: false,
        rejectUnauthorized: false,
        proxy
      })
    }
    : undefined
}

const expirableCounter = (value = 0, ttl = TEN_MIN_MS) => {
  let timestamp = Date.now()

  const incr = (steps = 0) => {
    const now = Date.now()
    if (now - timestamp > ttl) {
      timestamp = Date.now()
      value = 0
    }

    value += steps
    return value
  }

  return {
    val: () => incr(),
    incr: (n = 1) => incr(n)
  }
}

module.exports = {
  expirableCounter,
  getAgent,
  getTweetId,
  isTweet,
  isTweetUrl
}
