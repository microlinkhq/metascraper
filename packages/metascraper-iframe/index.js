'use strict'

const { stringify } = require('querystring')
const getVideoId = require('get-video-id')
const memoizeOne = require('memoize-one')

const parseUrl = memoizeOne(getVideoId)

module.exports = (opts = {}) => {
  const rules = {
    iframe: async ({
      url,
      meta,
      htmlDom,
      height = 360,
      width = 480,
      ...query
    }) => {
      const { id, service } = getVideoId(url)
      if (service === 'youtube') {
        return `<iframe src="https://www.youtube.com/embed/${id}?${stringify(
          query
        )}" width="${width}" height="${height}" frameborder="0" allowfullscreen>`
      }
    }
  }

  rules.test = ({ url }) => parseUrl(url).service === 'youtube'
  return rules
}
