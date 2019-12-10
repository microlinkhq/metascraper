'use strict'

const { extract, hasProvider } = require('oembed-parser')
const { memoizeOne } = require('@metascraper/helpers')
const { forEach, get } = require('lodash')
const pReflect = require('p-reflect')
const got = require('got')

const jsonOembed = memoizeOne($ => {
  const el = $('link[type="application/json+oembed"]')
  return el.attr('href')
})

const fromProvider = async ({ url, meta, htmlDom, ...opts }) => {
  const { value } = await pReflect(extract(url, opts))
  return get(value, 'html', null)
}

const fromHTML = async ({ url, meta, htmlDom, ...opts }) => {
  const oembedUrl = jsonOembed(htmlDom)
  if (!oembedUrl) return null

  const oembedUrlObj = new URL(oembedUrl)
  forEach(opts, (value, key) => oembedUrlObj.searchParams.append(key, value))

  const { value } = await pReflect(got(oembedUrlObj.toString(), { json: true }))
  return get(value, 'body.html', null)
}

const isValidUrl = memoizeOne(
  ({ url, htmlDom: $ }) => !!jsonOembed($) || hasProvider(url)
)

module.exports = () => {
  const rules = { iframe: [fromHTML, fromProvider] }
  rules.test = isValidUrl
  return rules
}

module.exports.isValidUrl = isValidUrl
