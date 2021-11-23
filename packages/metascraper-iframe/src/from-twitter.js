'use strict'

const { normalizeUrl, memoizeOne } = require('@metascraper/helpers')
const { map } = require('lodash')

const getPlayerUrl = memoizeOne(
  (url, $) =>
    normalizeUrl(
      url,
      $('meta[name="twitter:player"]').attr('content') ||
        $('meta[property="twitter:player"]').attr('content') ||
        $('meta[name="twitter:player:stream"]').attr('content') ||
        $('meta[property="twitter:player:stream"]').attr('content')
    ),
  memoizeOne.EqualityUrlAndHtmlDom
)

const fromTwitter = () => async ({ htmlDom, url, iframe }) => {
  const playerUrl = getPlayerUrl(url, htmlDom)
  if (!playerUrl) return
  const props = map(iframe, (value, key) => `${key}="${value}"`)
  const stringifiedProps = props.length === 0 ? '' : ' ' + props.join(' ')
  return `<iframe src="${playerUrl}" frameborder="0" scrolling="no"${stringifiedProps}></iframe>`
}

fromTwitter.test = (...args) => !!getPlayerUrl(...args)

module.exports = fromTwitter
module.exports.getPlayerUrl = getPlayerUrl
