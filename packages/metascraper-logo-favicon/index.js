'use strict'

const { getUrl } = require('@metascraper/helpers')

module.exports = () => ({
  logo: [({ htmlDom: $, meta, url }) => getUrl(url, `favicon.ico`)]
})
