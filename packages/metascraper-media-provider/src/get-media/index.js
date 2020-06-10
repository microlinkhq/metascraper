'use strict'

const { memoizeOne } = require('@metascraper/helpers')
const { noop } = require('lodash')

const createTwitterProvider = require('./provider/twitter')
const createGenericProvider = require('./provider/generic')
const { isTweetUrl } = require('./util')

module.exports = ({ onError = noop, userAgent, getProxy, cacheDir }) => {
  const fromGeneric = createGenericProvider({
    getProxy,
    cacheDir,
    userAgent,
    onError
  })

  const fromTwitter = createTwitterProvider({
    getProxy,
    userAgent,
    fromGeneric
  })

  return memoizeOne(url =>
    isTweetUrl(url) ? fromTwitter(url) : fromGeneric(url)
  )
}
