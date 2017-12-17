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

  return {
    logo: ({ htmlDom, meta, url: baseUrl }) => {
      const { origin, hostname } = new URL(baseUrl)
      if (meta.logo !== `${origin}/favicon.ico`) return
      return `${ENDPOINT}/${hostname}?size=${size}&format=${format}`
    }
  }
}
