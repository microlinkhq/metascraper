'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:provider:generic'
)
const { serializeError } = require('serialize-error')
const { parseUrl } = require('@metascraper/helpers')
const asyncMemoizeOne = require('async-memoize-one')
const youtubedl = require('youtube-dl-exec')
const pTimeout = require('p-timeout')

const RE_UNSUPPORTED_URL = /Unsupported URL/

const DEFAULT_FLAGS = {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true
}

module.exports = ({
  timeout = 30000,
  retry = 2,
  args: getArgs = ({ url, flags }) => ({ url, flags }),
  ...props
}) =>
  asyncMemoizeOne(async targetUrl => {
    const retryCount = 0
    let isTimeout = false
    let isSupportedURL = true
    let data

    const condition = () =>
      isSupportedURL && !isTimeout && data === undefined && retryCount <= retry

    const task = async () => {
      do {
        try {
          const { url, flags } = await getArgs({
            url: targetUrl,
            retryCount,
            flags: DEFAULT_FLAGS
          })

          data = await youtubedl(url, flags, { timeout, ...props })
        } catch (error) {
          if (condition()) {
            debug('getInfo:error', { retryCount }, serializeError(error))
          }

          const isYoutube = parseUrl(targetUrl).domain === 'youtube.com'
          const isUnsupported = RE_UNSUPPORTED_URL.test(error.stderr)
          isSupportedURL = isYoutube ? isUnsupported : !isUnsupported
        }
      } while (condition())

      return data
    }

    const fallback = () => {
      isTimeout = true
      return data
    }

    return pTimeout(task(), timeout, fallback).then(data => data ?? {})
  })

module.exports.DEFAULT_FLAGS = DEFAULT_FLAGS
