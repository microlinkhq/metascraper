'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:provider:generic'
)
const { serializeError } = require('serialize-error')
const asyncMemoizeOne = require('async-memoize-one')
const youtubedl = require('youtube-dl-exec')
const pTimeout = require('p-timeout')

const RE_UNSUPORTED_URL = /Unsupported URL/

const DEFAULT_FLAGS = {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
  preferFreeFormats: true
}

module.exports = ({
  timeout = 30000,
  retry = 2,
  flags: getFlags = ({ flags }) => flags,
  ...props
}) =>
  asyncMemoizeOne(async url => {
    const retryCount = 0
    let isTimeout = false
    let isSupportedURL = true
    let data

    const condition = () =>
      isSupportedURL && !isTimeout && data === undefined && retryCount <= retry

    const task = async () => {
      do {
        try {
          const flags = getFlags({ url, retryCount, flags: DEFAULT_FLAGS })
          data = await youtubedl(url, flags, { timeout, ...props })
        } catch (error) {
          if (condition()) {
            debug('getInfo:error', { retryCount }, serializeError(error))
          }
          isSupportedURL = !RE_UNSUPORTED_URL.test(error.stderr)
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
