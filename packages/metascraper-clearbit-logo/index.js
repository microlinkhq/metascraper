'use strict'

const { URL } = require('url')
const got = require('got')

const DEFAULTS = {
  size: '128',
  format: 'png',
  greyscale: false
}

const ENDPOINT = 'https://logo.clearbit.com'

module.exports = opts => {
  opts = { ...DEFAULTS, ...opts }

  const { size, format, greyscale } = opts

  const clearbitLogo = async ({ url }) => {
    const { hostname } = new URL(url)
    const logoUrl = `${ENDPOINT}/${hostname}?size=${size}&format=${format}${
      greyscale ? '&greyscale=true' : ''
    }`

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
