'use strict'

const { memoizeOne } = require('@metascraper/helpers')
const { noop } = require('lodash')

const createTwitterProvider = require('./provider/twitter')
const createGenericProvider = require('./provider/generic')
const { isTweetUrl, createProxiesPool } = require('./util')

module.exports = ({ onError = noop, userAgent, cacheDir, proxies }) => {
  const proxyPool = createProxiesPool(proxies)

  const fromGeneric = createGenericProvider({
    proxyPool,
    cacheDir,
    userAgent,
    onError
  })

  const fromTwitter = createTwitterProvider({
    proxyPool,
    userAgent,
    fromGeneric
  })

  return memoizeOne(url =>
    isTweetUrl(url) ? fromTwitter(url) : fromGeneric(url)
  )
}
