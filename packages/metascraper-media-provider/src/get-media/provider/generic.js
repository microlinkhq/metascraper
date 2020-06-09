'use strict'

const debug = require('debug-logfmt')('metascraper-media-provider:generic')
const { noop, constant, isEmpty } = require('lodash')
const youtubedl = require('youtube-dl')
const { promisify } = require('util')

const youtubedlError = require('./youtube-dl-error')

const getInfo = promisify(youtubedl.getInfo)

const getFlags = ({ proxy, url, userAgent, cacheDir }) => {
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
  if (proxy) flags.push(`--proxy=${proxy.toString()}`)
  return flags
}

const canRetry = proxy => !!proxy

module.exports = ({
  getProxy = constant(false),
  onError = noop,
  cacheDir,
  userAgent,
  ...props
}) => {
  return async url => {
    let isUnsupportedUrl = false
    let retry = 0
    let proxy = getProxy(url, retry)
    let data = {}

    do {
      const flags = getFlags({ url, proxy, userAgent, cacheDir })

      debug(`getInfo retry=${retry} url=${url} flags=${flags.join(' ')}`)

      try {
        data = await getInfo(url, flags, props)
      } catch (rawError) {
        const error = youtubedlError({ rawError, url, flags })

        debug('getInfo:error', error.message || error)
        onError(url, error)

        if (error.unsupportedUrl) {
          isUnsupportedUrl = true
        } else {
          proxy = getProxy(url, ++retry)
        }
      }
    } while (isEmpty(data) && !isUnsupportedUrl && canRetry(proxy))

    return data
  }
}
