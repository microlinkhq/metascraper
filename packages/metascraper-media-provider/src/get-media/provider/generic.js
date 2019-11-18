'use strict'

const debug = require('debug')('metascraper-media-provider:generic')
const youtubedl = require('youtube-dl')
const { isEmpty } = require('lodash')
const { promisify } = require('util')

const { isVimeoUrl, getAgent, expirableCounter, proxyUri } = require('../util')
const youtubedlError = require('./youtube-dl-error')

const getInfo = promisify(youtubedl.getInfo)

const getFlags = ({ url, agent, userAgent, cacheDir }) => {
  const flags = [
    '--no-warnings',
    '--no-call-home',
    '--no-check-certificate',
    '--prefer-free-formats',
    '--youtube-skip-dash-manifest',
    `--referer=${url}`
  ]
  if (cacheDir) flags.push(`--cache-dir=${cacheDir}`)
  if (userAgent) flags.push(`--user-agent=${userAgent}`)
  if (agent) flags.push(`--proxy=${proxyUri(agent)}`)
  return flags
}

module.exports = ({ tunnel, onError, userAgent, cacheDir }) => {
  const retry = expirableCounter()
  const hasTunnel = () => tunnel && retry.val() < tunnel.size()

  return async url => {
    let data = {}
    do {
      const agent =
        retry.val() || isVimeoUrl(url) ? getAgent(tunnel) : undefined
      const flags = getFlags({ url, agent, userAgent, cacheDir })
      debug(`getInfo retry=${retry.val()} url=${url} flags=${flags.join(' ')}`)
      try {
        data = await getInfo(url, flags)
      } catch (rawError) {
        const err = youtubedlError({ rawError, url, flags })
        debug('getInfo:err', err.message)
        onError(err, url)
        if (err.unsupportedUrl) return data
        if (!tunnel) return data
        retry.incr()
      }
    } while (isEmpty(data) && hasTunnel())
    return data
  }
}
