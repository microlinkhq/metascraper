'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:provider:generic'
)
const { serializeError } = require('serialize-error')
const youtubedl = require('youtube-dl-exec')
const { get, constant } = require('lodash')
const pTimeout = require('p-timeout')

const RE_UNSUPORTED_URL = /Unsupported URL/

const getFlags = ({ proxy, url, userAgent, cacheDir }) => {
  const flags = {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true
  }

  flags.addHeader = [
    `referer:${url}`,
    userAgent && `user-agent:${userAgent}`
  ].filter(Boolean)

  if (cacheDir) flags.cacheDir = cacheDir
  else flags.noCacheDir = true

  if (proxy) flags.proxy = proxy.toString()

  return flags
}

module.exports = ({
  cacheDir,
  getProxy = constant(false),
  getAgent, // destructure to don't pass it
  timeout = 30000,
  retry = 2,
  gotOpts,
  ...props
}) => {
  return async url => {
    let retryCount = 0
    let isTimeout = false
    let isSupportedURL = true
    let data

    const condition = () =>
      isSupportedURL && !isTimeout && data === undefined && retryCount <= retry

    const userAgent = get(gotOpts, 'headers.user-agent')

    const task = async () => {
      do {
        try {
          const proxy = getProxy({ url, retryCount: retryCount++ })
          const flags = getFlags({ url, proxy, userAgent, cacheDir })
          data = await youtubedl(url, flags, { timeout, ...props })
        } catch (error) {
          if (condition()) {
            debug('getInfo:error', { retryCount }, serializeError(error))
          }
          isSupportedURL = !RE_UNSUPORTED_URL.test(error.stderr)
          console.log('catch', { isSupportedURL })
        }
      } while (condition())

      return data
    }

    const fallback = () => {
      isTimeout = true
      return data
    }

    return pTimeout(task(), timeout, fallback)
  }
}

module.exports.getFlags = getFlags
