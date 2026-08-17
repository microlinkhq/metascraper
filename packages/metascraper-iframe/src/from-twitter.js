'use strict'

const { $meta, memoizeOne } = require('@metascraper/helpers')
const { map } = require('lodash')

const getPlayerUrl = memoizeOne(
  (_, $) => $meta('twitter:player')($),
  memoizeOne.EqualityUrlAndHtmlDom
)

const playerWidth = $ => $meta('twitter:player:width')($)

const playerHeight = $ => $meta('twitter:player:height')($)

const fromTwitter =
  () =>
    async ({ htmlDom, url, iframe }) => {
      const playerUrl = getPlayerUrl(url, htmlDom)
      if (!playerUrl) return

      const props = map(
        { width: playerWidth(htmlDom), height: playerHeight(htmlDom), ...iframe },
        (value, key) => (value === undefined ? value : `${key}="${value}"`)
      )
        .filter(Boolean)
        .join(' ')

      return `<iframe src="${playerUrl}" frameborder="0" scrolling="no" ${props}></iframe>`
    }

fromTwitter.test = (url, $) => getPlayerUrl(url, $) !== undefined

module.exports = fromTwitter
module.exports.getPlayerUrl = getPlayerUrl
