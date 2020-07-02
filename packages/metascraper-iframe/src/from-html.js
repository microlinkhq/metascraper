'use strict'

const { memoizeOne } = require('@metascraper/helpers')
const { forEach, get } = require('lodash')
const pReflect = require('p-reflect')
const got = require('got')

const jsonOembed = memoizeOne($ =>
  $('link[type="application/json+oembed"]').attr('href')
)

const fromHTML = gotOpts => async ({ url, meta, htmlDom, ...opts }) => {
  const oembedUrl = jsonOembed(htmlDom)
  if (!oembedUrl) return null
  const oembedUrlObj = new URL(oembedUrl)
  forEach(opts, (value, key) =>
    oembedUrlObj.searchParams.append(key.toLowerCase(), value)
  )
  const { value } = await pReflect(got(oembedUrlObj.toString(), gotOpts).json())
  return get(value, 'html', null)
}

fromHTML.test = $ => !!jsonOembed($)

module.exports = fromHTML
