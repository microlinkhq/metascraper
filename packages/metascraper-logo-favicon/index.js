'use strict'

const { resolve: resolveUrl, URL } = require('url')

const getFaviconUrl = url => {
  const {origin} = new URL(url)
  return resolveUrl(origin, 'favicon.ico')
}

module.exports = () => ({
  logo: [({ htmlDom: $, meta, url }) => getFaviconUrl(url)]
})
