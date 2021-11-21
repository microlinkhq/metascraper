'use strict'

const { normalizeUrl, memoizeOne } = require('@metascraper/helpers')
const { forEach, get } = require('lodash')
const pReflect = require('p-reflect')
const got = require('got')

const getPlayerUrl = memoizeOne(
  (url, $) =>
    normalizeUrl(
      url,
      $('meta[name="twitter:player"]').attr('content') ||
        $('meta[property="twitter:player"]').attr('content')
    ),
  memoizeOne.EqualityUrlAndHtmlDom
)

const fromTwitter = gotOpts => async ({ htmlDom, url, iframe }) => {
  const playerUrl = getPlayerUrl(url, htmlDom)
  if (!playerUrl) return

  const playerUrlObj = new URL(playerUrl)
  forEach(iframe, (value, key) =>
    playerUrlObj.searchParams.append(key.toLowerCase(), value)
  )
  const { value } = await pReflect(got(playerUrlObj.toString(), gotOpts).json())
  return get(value, 'html')
}

fromTwitter.test = (...args) => !!getPlayerUrl(...args)

module.exports = fromTwitter
module.exports.getPlayerUrl = getPlayerUrl
