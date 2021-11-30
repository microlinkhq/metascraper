'use strict'

const { normalizeUrl, memoizeOne } = require('@metascraper/helpers')
const { map } = require('lodash')

const getPlayerUrl = memoizeOne(
  (url, $) =>
    normalizeUrl(
      url,
      $('meta[name="twitter:player"]').attr('content') ||
        $('meta[property="twitter:player"]').attr('content')
    ),
  memoizeOne.EqualityUrlAndHtmlDom
)

const getPlayerWidth = ($) => (
  $('meta[name="twitter:player:width"]').attr("content") ||
  $('meta[property="twitter:player:width"]').attr("content")
);

const getPlayerHeight = ($) => (
  $('meta[name="twitter:player:height"]').attr("content") ||
  $('meta[property="twitter:player:height"]').attr("content")
);

const fromTwitter = () => async ({ htmlDom, url, iframe }) => {
  const playerWidth = getPlayerWidth(url, htmlDom)
  const playerHeight = getPlayerHeight(url, htmlDom)
  const playerUrl = getPlayerUrl(url, htmlDom)
  if (!playerUrl) return

  const props = [
    'frameborder="0"',
    'scrolling="no"',
    `width="${playerWidth}px"`,
    `height="${playerHeight}px"`,
    ...map(iframe, (value, key) => `${key}="${value}"`)
  ]

  return `<iframe src="${playerUrl}" ${props.join(' ')}></iframe>`
}

fromTwitter.test = (...args) => !!getPlayerUrl(...args)

module.exports = fromTwitter
module.exports.getPlayerUrl = getPlayerUrl
