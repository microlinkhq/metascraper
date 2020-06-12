'use strict'

const { memoizeOne } = require('@metascraper/helpers')

const createTwitterProvider = require('./provider/twitter')
const createGenericProvider = require('./provider/generic')
const { isTweetUrl } = require('./util')

module.exports = props => {
  const fromGeneric = createGenericProvider(props)
  const fromTwitter = createTwitterProvider({ ...props, fromGeneric })
  return memoizeOne(url =>
    isTweetUrl(url) ? fromTwitter(url) : fromGeneric(url)
  )
}
