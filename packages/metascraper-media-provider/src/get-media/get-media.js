'use strict'

const youtubedl = require('@microlink/youtube-dl')
const { promisify } = require('util')
const { noop } = require('lodash')

const getInfo = promisify(youtubedl.getInfo)

const getFlags = ({ userAgent, cacheDir }) => {
  const flags = ['--no-check-certificate', '--prefer-free-formats']
  if (cacheDir) flags.push(`--cache-dir=${cacheDir}`)
  if (userAgent) flags.push(`--user-agent=${userAgent}`)
  return flags
}

module.exports = ({ onError = noop, ...opts } = {}) => {
  const baseFlags = getFlags(opts)

  return async url => {
    const flags = baseFlags.concat([`--referer=${url}`])

    let data = {}
    try {
      data = await getInfo(url, flags)
    } catch (err) {
      onError(err, url)
    }

    return data
  }
}
