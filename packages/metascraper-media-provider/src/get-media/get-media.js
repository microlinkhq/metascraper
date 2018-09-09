'use strict'

const youtubedl = require('youtube-dl')
const { promisify } = require('util')

const getInfo = promisify(youtubedl.getInfo)

module.exports = ({ cacheDir } = {}) => {
  const opts = cacheDir ? [`--cache-dir=${cacheDir}`] : []

  return async url => {
    let data = {}
    try {
      data = await getInfo(url, opts)
    } catch (err) {}

    return data
  }
}
