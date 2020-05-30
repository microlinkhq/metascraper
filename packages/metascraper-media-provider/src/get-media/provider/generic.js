'use strict'

const debug = require('debug')('metascraper-media-provider:generic')
const youtubedl = require('youtube-dl')
const { isEmpty } = require('lodash')
const { promisify } = require('util')

const { isDomainUrl, getAgent, expirableCounter, proxyUri } = require('../util')
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

module.exports = ({ proxyPool, onError, userAgent, cacheDir }) => {
  const retry = expirableCounter()
  const hasProxy = () => proxyPool && retry.val() < proxyPool.size()

  return async url => {
    let data = {}
    do {
      const agent =
        retry.val() || isDomainUrl(url, ['vimeo'])
          ? getAgent(proxyPool)
          : undefined
      const flags = getFlags({ url, agent, userAgent, cacheDir })
      debug(
        `getInfo retry=${retry.val()} url=${url} flags=${flags
          .join(' ')
          .replace(/--proxy=(.*)/g, '--proxy=***')}`
      )

      try {
        data = await getInfo(url, flags)
      } catch (rawError) {
        const error = youtubedlError({ rawError, url, flags })
        debug('getInfo:error', error.message)
        onError(error, url)
        if (error.unsupportedUrl) return data
        if (!proxyPool) return data
        retry.incr()
      }
    } while (isEmpty(data) && hasProxy())
    return data
  }
}
