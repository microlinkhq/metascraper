'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:provider:generic'
)
const { serializeError } = require('serialize-error')
const { parseUrl } = require('@metascraper/helpers')
const youtubedl = require('youtube-dl-exec')

const createLastAndInFlightCache = require('./create-last-and-inflight-cache')

const RE_UNSUPPORTED_URL = /Unsupported URL/

const DEFAULT_FLAGS = {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true
}

const getMedia = async ({
  targetUrl,
  getArgs,
  retry,
  timeout,
  props,
  run = youtubedl
}) => {
  let retryCount = 0
  let isSupportedURL = true
  let data
  const startTime = Date.now()

  const isTimeout = () =>
    timeout !== Infinity && Date.now() - startTime >= timeout

  const getRemainingTimeout = () =>
    timeout === Infinity
      ? Infinity
      : Math.max(1, timeout - (Date.now() - startTime))

  const shouldRetry = () =>
    isSupportedURL && !isTimeout() && data === undefined && retryCount <= retry

  do {
    try {
      const { url, flags } = await getArgs({
        url: targetUrl,
        retryCount,
        flags: DEFAULT_FLAGS
      })

      data = await run(url, flags, { timeout: getRemainingTimeout(), ...props })
    } catch (error) {
      const isYoutube = parseUrl(targetUrl).domain === 'youtube.com'
      const isUnsupported = RE_UNSUPPORTED_URL.test(error.stderr)
      isSupportedURL = isYoutube ? isUnsupported : !isUnsupported

      if (shouldRetry()) {
        debug('getInfo:error', { retryCount }, serializeError(error))
      }
    }

    retryCount += 1
  } while (shouldRetry())

  return data ?? {}
}

module.exports = ({
  timeout = 30000,
  retry = 2,
  args: getArgs = ({ url, flags }) => ({ url, flags }),
  run = youtubedl,
  ...props
}) =>
  createLastAndInFlightCache(targetUrl =>
    getMedia({
      targetUrl,
      getArgs,
      retry,
      timeout,
      props,
      run
    })
  )

module.exports.DEFAULT_FLAGS = DEFAULT_FLAGS
module.exports.getMedia = getMedia
