'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:provider:generic'
)
const { noop, constant, isEmpty } = require('lodash')
const pDoWhilst = require('p-do-whilst')
const youtubedl = require('youtube-dl')
const { promisify } = require('util')
const pTimeout = require('p-timeout')

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

module.exports = ({
  cacheDir,
  getProxy = constant(false),
  onError = noop,
  timeout = 30000,
  userAgent,
  ...props
}) => {
  return async url => {
    let retryCount = 0
    let data = {}
    let isTimeout = false

    const task = async () => {
      await pDoWhilst(
        async () => {
          try {
            const proxy = getProxy({ url, retryCount: retryCount++ })
            const flags = getFlags({ url, proxy, userAgent, cacheDir })
            data = await getInfo(url, flags, { timeout, ...props })
          } catch (error) {
            debug('getInfo:error', { retryCount }, error)
            onError(url, error)
          }
        },
        () => !isTimeout && isEmpty(data)
      )
      return data
    }

    const fallback = () => {
      isTimeout = true
      return data
    }

    return pTimeout(task(), timeout, fallback)
  }
}
