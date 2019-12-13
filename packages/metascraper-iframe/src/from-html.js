'use strict'

const { memoizeOne } = require('@metascraper/helpers')
const { forEach, get } = require('lodash')
const pReflect = require('p-reflect')
const got = require('got')

const jsonOembed = memoizeOne($ =>
  $('link[type="application/json+oembed"]').attr('href')
)

const fromHTML = async ({ url, meta, htmlDom, ...opts }) => {
  const oembedUrl = jsonOembed(htmlDom)
  if (!oembedUrl) return null
  const oembedUrlObj = new URL(oembedUrl)
  forEach(opts, (value, key) => oembedUrlObj.searchParams.append(key, value))
  const { value } = await pReflect(got(oembedUrlObj.toString(), { json: true }))
  return get(value, 'body.html', null)
}

fromHTML.test = $ => !!jsonOembed($)

module.exports = fromHTML
