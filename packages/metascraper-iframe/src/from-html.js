'use strict'

const { normalizeUrl, memoizeOne } = require('@metascraper/helpers')
const { forEach, get } = require('lodash')
const pReflect = require('p-reflect')
const got = require('got')

const getOembedUrl = memoizeOne((url, $) => {
  const oembedUrl =
    $('link[type="application/json+oembed"]').attr('href') ||
    $('link[type="text/xml+oembed"]').attr('href')

  return oembedUrl === undefined ? undefined : normalizeUrl(url, oembedUrl)
}, memoizeOne.EqualityUrlAndHtmlDom)

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

fromHTML.test = (url, $) => getOembedUrl(url, $) !== undefined

module.exports = fromHTML
module.exports.getOembedUrl = getOembedUrl
