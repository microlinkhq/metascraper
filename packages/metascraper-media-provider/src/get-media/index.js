'use strict'

const memoizeOne = require('memoize-one')
const { noop } = require('lodash')

const { isTwitterUrl, createTunnel } = require('./util')
const createTwitterProvider = require('./provider/twitter')
const createGenericProvider = require('./provider/generic')

module.exports = ({ onError = noop, userAgent, cacheDir, proxies }) => {
  const getTunnel = createTunnel({ proxies })
  const fromGeneric = createGenericProvider({ getTunnel, cacheDir, userAgent, onError })
  const fromTwitter = createTwitterProvider({ getTunnel, userAgent, fromGeneric })
  const getInfo = async url => (isTwitterUrl(url) ? fromTwitter(url) : fromGeneric(url))
  return memoizeOne(getInfo)
}
