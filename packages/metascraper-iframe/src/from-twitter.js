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

const fromTwitter = () => async ({ htmlDom, url, iframe }) => {
  const playerUrl = getPlayerUrl(url, htmlDom)
  if (!playerUrl) return

  const props = [
    'frameborder="0"',
    'scrolling="no"',
    ...map(iframe, (value, key) => `${key}="${value}"`)
  ]

  return `<iframe src="${playerUrl}" ${props.join(' ')}></iframe>`
}

fromTwitter.test = (...args) => !!getPlayerUrl(...args)

module.exports = fromTwitter
module.exports.getPlayerUrl = getPlayerUrl
