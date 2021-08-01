'use strict'

const { normalizeUrl, memoizeOne } = require('@metascraper/helpers')
const { forEach, get } = require('lodash')
const pReflect = require('p-reflect')
const got = require('got')

const getOembedUrl = memoizeOne(
  (url, $) =>
    normalizeUrl(
      url,
      $('link[type="application/json+oembed"]').attr('href') ||
        $('link[type="text/xml+oembed"]').attr('href')
    ),
  memoizeOne.EqualityUrlAndHtmlDom
)

const fromHTML = gotOpts => async ({ htmlDom, url, iframe }) => {
  const oembedUrl = getOembedUrl(url, htmlDom)
  if (!oembedUrl) return

  const oembedUrlObj = new URL(oembedUrl)
  forEach(iframe, (value, key) =>
    oembedUrlObj.searchParams.append(key.toLowerCase(), value)
  )
  const { value } = await pReflect(got(oembedUrlObj.toString(), gotOpts).json())
  return get(value, 'html')
}

fromHTML.test = (...args) => !!getOembedUrl(...args)

module.exports = fromHTML
module.exports.getOembedUrl = getOembedUrl
