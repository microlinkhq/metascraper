'use strict'

const { URL } = require('url')
const got = require('got')

const DEFAULTS = {
  size: '128',
  format: 'png'
}

const ENDPOINT = 'https://logo.clearbit.com'

module.exports = opts => {
  opts = Object.assign({}, DEFAULTS, opts)
  const { size, format } = opts

  const clearbitLogo = async ({ url }) => {
    const { hostname } = new URL(url)
    const logoUrl = `${ENDPOINT}/${hostname}?size=${size}&format=${format}`

    try {
      await got.head(logoUrl)
      return logoUrl
    } catch (err) {
      return null
    }
  }

  return {
    logo: clearbitLogo
  }
}
