'use strict'

const memoizeOne = require('memoize-one')
const { noop } = require('lodash')

const { isTwitterUrl, createTunnel } = require('./util')
const createTwitterProvider = require('./provider/twitter')
const createGenericProvider = require('./provider/generic')

module.exports = ({ onError = noop, userAgent, cacheDir, proxies }) => {
  const tunnel = createTunnel(proxies)
  const fromGeneric = createGenericProvider({
    tunnel,
    cacheDir,
    userAgent,
    onError
  })
  const fromTwitter = createTwitterProvider({ tunnel, userAgent, fromGeneric })
  return memoizeOne(async url =>
    isTwitterUrl(url) ? fromTwitter(url) : fromGeneric(url)
  )
}
