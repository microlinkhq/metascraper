'use strict'

const debug = require('debug')('metascraper-media-provider:util')
const { getDomainWithoutSuffix } = require('tldts')
const proxiesPool = require('proxies-pool')
const { isEmpty } = require('lodash')
const tunnel = require('tunnel')

const TEN_MIN_MS = 10 * 60 * 1000

const isTweet = url => url.includes('/status/')

const isTweetUrl = url =>
  isTweet(url) && getDomainWithoutSuffix(url) === 'twitter'

const isVimeoUrl = url => getDomainWithoutSuffix(url) === 'vimeo'

const getTweetId = url => url.split('/').reverse()[0]

const getAgent = proxyPool => {
  if (!proxyPool) return
  const proxy = proxyPool()
  debug(`getAgent proxy=${proxyPool.index()}/${proxyPool.size()}`)
  return {
    agent: {
      http: tunnel.httpOverHttp(proxy)
    }
  }
}

const createProxiesPool = (proxies, fromIndex) => {
  if (isEmpty(proxies)) return
  const proxyPool = proxiesPool(proxies, fromIndex)
  debug(`proxiesPool size=${proxyPool.size()}`)
  return proxyPool
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

const proxyUri = ({ agent }) => {
  const { proxyAuth, host, port } = agent.http.options
  return `https://${proxyAuth}@${host}:${port}`
}

module.exports = {
  createProxiesPool,
  expirableCounter,
  getAgent,
  getTweetId,
  isTweet,
  isTweetUrl,
  isVimeoUrl,
  proxyUri
}
