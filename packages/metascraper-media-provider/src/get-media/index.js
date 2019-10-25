'use strict'

const memoizeOne = require('memoize-one')
const { noop } = require('lodash')

const createTwitterProvider = require('./provider/twitter')
const createGenericProvider = require('./provider/generic')
const { isTweetUrl, createTunnel } = require('./util')

module.exports = ({ onError = noop, userAgent, cacheDir, proxies }) => {
  const tunnel = createTunnel(proxies)
  const fromGeneric = createGenericProvider({
    tunnel,
    cacheDir,
    userAgent,
    onError
  })
  const fromTwitter = createTwitterProvider({ tunnel, userAgent, fromGeneric })

  return memoizeOne(url =>
    isTweetUrl(url) ? fromTwitter(url) : fromGeneric(url)
  )
}
