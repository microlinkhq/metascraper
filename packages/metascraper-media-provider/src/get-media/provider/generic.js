'use strict'

const debug = require('debug')('metascraper-media-provider:generic')
const { get, isEmpty } = require('lodash')
const youtubedl = require('youtube-dl')
const { promisify } = require('util')

const {
  getAgent,
  isTwitterUrl,
  expirableCounter,
  proxyUri
} = require('../util')

const getInfo = promisify(youtubedl.getInfo)

const REGEX_RATE_LIMIT = /429: Too Many Requests/i

const REGEX_ERR_MESSAGE = /ERROR: (.*);?/

const isTwitterRateLimit = (url, err) =>
  isTwitterUrl(url) && REGEX_RATE_LIMIT.test(err.message)

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

const makeError = ({ rawError, url, flags }) => {
  let message

  if (rawError.message) {
    const extractedMessage = get(REGEX_ERR_MESSAGE.exec(rawError.message), '1')
    if (extractedMessage) message = extractedMessage.split('; ')[0]
  } else {
    message = rawError
  }

  const error = new Error(message)
  error.name = 'youtubedlError'
  error.code = rawError.code
  error.signal = rawError.signal
  error.url = url
  error.flags = flags

  return error
}

module.exports = ({ tunnel, onError, userAgent, cacheDir }) => {
  const retry = expirableCounter()
  return async url => {
    let data = {}
    do {
      const agent =
        isTwitterUrl(url) && retry.val() ? getAgent(tunnel) : undefined
      const flags = getFlags({ url, agent, userAgent, cacheDir })
      debug(`getInfo retry=${retry.val()} url=${url} flags=${flags.join(' ')}`)
      try {
        data = await getInfo(url, flags)
      } catch (rawError) {
        const err = makeError({ rawError, url, flags })
        debug('getInfo:err', err.message)
        onError(err, url)
        if (!tunnel && isTwitterRateLimit(url, err)) return data
        retry.incr()
      }
    } while (isEmpty(data) && retry.val() < tunnel.size())
    return data
  }
}

module.exports.makeError = makeError
