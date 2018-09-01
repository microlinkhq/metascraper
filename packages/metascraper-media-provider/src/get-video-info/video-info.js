'use strict'

const youtubedl = require('youtube-dl')
const { promisify } = require('util')

const getInfo = promisify(youtubedl.getInfo)

module.exports = ({ cacheDir } = {}) => {
  const opts = cacheDir ? [`--cache-dir=${cacheDir}`] : []
  return url => getInfo(url, opts)
}
