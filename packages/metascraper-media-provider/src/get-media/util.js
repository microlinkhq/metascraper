'use strict'

const debug = require('debug')('metascraper-media-provider:util')
const { getDomainWithoutSuffix } = require('tldts')
const luminatiTunnel = require('luminati-tunnel')
const { isEmpty } = require('lodash')

const TEN_MIN_MS = 10 * 60 * 1000

const isTweet = url => url.includes('/status/')

const isTweetUrl = url =>
  isTweet(url) && getDomainWithoutSuffix(url) === 'twitter'

const isVimeoUrl = url => getDomainWithoutSuffix(url) === 'vimeo'

const getTweetId = url => url.split('/').reverse()[0]

const getAgent = tunnel => {
  if (!tunnel) return
  const agent = tunnel()
  debug(`getAgent agent=${tunnel.index()}/${tunnel.size()}`)
  return agent
}

const createTunnel = (proxies, opts) => {
  if (isEmpty(proxies)) return
  const tunnel = luminatiTunnel(proxies, opts)
  debug(`tunnel size=${tunnel.size()}`)
  return tunnel
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

const proxyUri = agent => {
  const { proxy } = agent.options
  const { proxyAuth, host, port } = proxy
  return `https://${proxyAuth}@${host}:${port}`
}

module.exports = {
  proxyUri,
  isTweet,
  isVimeoUrl,
  isTweetUrl,
  getTweetId,
  getAgent,
  createTunnel,
  expirableCounter
}
