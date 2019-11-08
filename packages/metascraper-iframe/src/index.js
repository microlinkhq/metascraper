'use strict'

const getVideoId = require('get-video-id')
const memoizeOne = require('memoize-one')

const providers = require('./providers')

const parseUrl = memoizeOne(getVideoId)

module.exports = (opts = {}) => {
  const rules = {
    iframe: async ({ url, meta, htmlDom, ...query }) => {
      const { id, service } = getVideoId(url)
      return providers[service]({ id, url, ...query })
    }
  }

  rules.test = ({ url }) => {
    const { service } = parseUrl(url)
    return service === 'youtube' || service === 'vimeo'
  }
  return rules
}
