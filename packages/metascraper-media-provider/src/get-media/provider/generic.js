'use strict'

const debug = require('debug')('metascraper-media-provider:generic')
const youtubedl = require('@microlink/youtube-dl')
const { promisify } = require('util')

const getInfo = promisify(youtubedl.getInfo)

const getFlags = ({ userAgent, cacheDir }) => {
  const flags = ['--no-check-certificate', '--prefer-free-formats', '--youtube-skip-dash-manifest']
  if (cacheDir) flags.push(`--cache-dir=${cacheDir}`)
  if (userAgent) flags.push(`--user-agent=${userAgent}`)
  return flags
}

module.exports = ({ onError, userAgent, cacheDir }) => {
  const baseFlags = getFlags({ userAgent, cacheDir })

  return async url => {
    const flags = baseFlags.concat([`--referer=${url}`])
    debug(`getInfo ${url} ${flags.join(' ')}`)

    let data = {}
    try {
      data = await getInfo(url, flags)
    } catch (err) {
      onError(err, url)
    }

    return data
  }
}
