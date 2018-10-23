'use strict'

const youtubedl = require('youtube-dl')
const { promisify } = require('util')
const { get } = require('lodash')

const { PROXY_HOST, PROXY_PORT, PROXY_USER, PROXY_PASS } = process.env

const PROXY_URL =
  PROXY_HOST && `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`

const RE_RATE_LIMIT = /429: Too Many Requests/i

const getInfo = promisify(youtubedl.getInfo)

const isRateLimit = (str = '') => RE_RATE_LIMIT.test(str)

module.exports = ({ cacheDir } = {}) => {
  const opts = cacheDir ? [`--cache-dir=${cacheDir}`] : []

  return async url => {
    let data = {}

    try {
      data = await getInfo(url, opts)
    } catch (err) {
      if (isRateLimit(get(err, 'message')) && PROXY_URL) {
        try {
          data = await getInfo(url, [...opts, `--proxy=${PROXY_URL}`])
        } catch (err) {}
      }
    }

    return data
  }
}
