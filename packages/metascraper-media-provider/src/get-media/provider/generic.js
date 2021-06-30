'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:provider:generic'
)
const { noop, constant, isEmpty } = require('lodash')
const youtubedl = require('youtube-dl-exec')
const pDoWhilst = require('p-do-whilst')
const pTimeout = require('p-timeout')

const RE_UNSUPORTED_URL = /Unsupported URL/

const getFlags = ({ proxy, url, userAgent, cacheDir }) => {
  const flags = {
    dumpSingleJson: true,
    noCallHome: true,
    noCheckCertificate: true,
    noWarnings: true,
    preferFreeFormats: true,
    referer: url,
    youtubeSkipDashManifest: true
  }
  if (cacheDir) flags.cacheDir = cacheDir
  if (userAgent) flags.userAgent = userAgent
  if (proxy) flags.proxy = proxy.toString()
  return flags
}

module.exports = ({
  cacheDir,
  getProxy = constant(false),
  onError = noop,
  timeout = 30000,
  retry = 2,
  userAgent,
  ...props
}) => {
  return async url => {
    let retryCount = 0
    let data = {}
    let isTimeout = false
    let isSupportedURL = true

    const condition = () =>
      isSupportedURL && !isTimeout && isEmpty(data) && retryCount <= retry

    const task = async () => {
      await pDoWhilst(async () => {
        try {
          const proxy = getProxy({ url, retryCount: retryCount++ })
          const flags = getFlags({ url, proxy, userAgent, cacheDir })
          data = await youtubedl(url, flags, { timeout, ...props })
        } catch (error) {
          if (condition()) {
            debug('getInfo:error', { retryCount }, error)
            onError(url, error)
          }
          isSupportedURL = !RE_UNSUPORTED_URL.test(error.stderr)
        }
      }, condition)

      return data
    }

    const fallback = () => {
      isTimeout = true
      return data
    }

    return pTimeout(task(), timeout, fallback)
  }
}
