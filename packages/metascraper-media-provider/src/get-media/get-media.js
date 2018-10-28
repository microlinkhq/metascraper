'use strict'

const youtubedl = require('youtube-dl')
const { promisify } = require('util')
const { noop } = require('lodash')

const { isTwitterUrl } = require('./twitter-info')

const { PROXY_HOST, PROXY_PORT, PROXY_USER, PROXY_PASS } = process.env

const PROXY_URL =
  PROXY_HOST && `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`

const getInfo = promisify(youtubedl.getInfo)

module.exports = ({ cacheDir, onError = noop } = {}) => {
  const opts = cacheDir ? [`--cache-dir=${cacheDir}`] : []

  return async url => {
    let data = {}
    try {
      data = await getInfo(
        url,
        isTwitterUrl(url) && PROXY_URL
          ? [...opts, `--proxy=${PROXY_URL}`]
          : opts
      )
    } catch (err) {
      onError(err, url)
    }

    return data
  }
}
