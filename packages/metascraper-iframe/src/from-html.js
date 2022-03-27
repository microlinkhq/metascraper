'use strict'

const { normalizeUrl, memoizeOne } = require('@metascraper/helpers')
const { forEach, get } = require('lodash')
const pReflect = require('p-reflect')
const got = require('got')

const getOembedUrl = memoizeOne(
  (url, $, iframe) => {
    const oembedUrl =
      $('link[type="application/json+oembed"]').attr('href') ||
      $('link[type="text/xml+oembed"]').attr('href')

    if (!oembedUrl) return

    const oembedUrlObj = new URL(normalizeUrl(url, oembedUrl))

    forEach(iframe, (value, key) =>
      oembedUrlObj.searchParams.append(key.toLowerCase(), value)
    )

    return oembedUrlObj.toString()
  },
  (newArgs, oldArgs) =>
    JSON.stringify(oldArgs[2]) === JSON.stringify(newArgs[2]) &&
    memoizeOne.EqualityUrlAndHtmlDom(newArgs, oldArgs)
)

const fromHTML = ({ gotOpts }) => async ({ htmlDom, url, iframe }) => {
  const oembedUrl = getOembedUrl(url, htmlDom, iframe)
  if (!oembedUrl) return
  const { value } = await pReflect(got(oembedUrl, gotOpts).json())
  return get(value, 'html')
}

fromHTML.test = (url, $) => getOembedUrl(url, $) !== undefined

module.exports = fromHTML
module.exports.getOembedUrl = getOembedUrl
