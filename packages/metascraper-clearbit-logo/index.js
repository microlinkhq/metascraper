'use strict'

const { URL } = require('url')

const DEFAULTS = {
  size: '128',
  format: 'png'
}

const ENDPOINT = 'https://logo.clearbit.com'

module.exports = opts => {
  opts = Object.assign({}, DEFAULTS, opts)
  const { size, format } = opts

  const clearbitLogo = ({ htmlDom, meta, url: baseUrl }) => {
    const { hostname } = new URL(baseUrl)
    return `${ENDPOINT}/${hostname}?size=${size}&format=${format}`
  }

  return {
    logo: clearbitLogo
  }
}
