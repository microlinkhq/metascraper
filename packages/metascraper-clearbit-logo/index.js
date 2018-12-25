'use strict'

const { URL } = require('url')
const qsm = require('qsm')

const got = require('got')

const ENDPOINT = 'https://logo.clearbit.com'

const apiUrl = (url, opts = {}) => {
  const { hostname } = new URL(url)
  const apiUrl = `${ENDPOINT}/${hostname}`
  return qsm.add(apiUrl, opts)
}

module.exports = opts => {
  const clearbitLogo = async ({ url }) => {
    const logoUrl = apiUrl(url, opts)

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

module.exports.apiUrl = apiUrl
