'use strict'

const asyncMemoizeOne = require('async-memoize-one')

const createTwitterProvider = require('./provider/twitter')
const createGenericProvider = require('./provider/generic')
const { isTweetUrl } = require('./util')

module.exports = props => {
  const fromGeneric = createGenericProvider(props)
  const fromTwitter = createTwitterProvider({ ...props, fromGeneric })

  return asyncMemoizeOne(async url => {
    const result = await (isTweetUrl(url) ? fromTwitter(url) : fromGeneric(url))
    return result || {}
  })
}
