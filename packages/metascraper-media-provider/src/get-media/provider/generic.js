'use strict'

const debug = require('debug')('metascraper-media-provider:generic')
const youtubedl = require('@microlink/youtube-dl')
const { isEmpty } = require('lodash')
const { promisify } = require('util')

const { getAgent, isTwitterUrl, expirableCounter } = require('../util')

const getInfo = promisify(youtubedl.getInfo)

const REGEX_RATE_LIMIT = /429: Too Many Requests/i

const REGEX_ERR_MESSAGE = /ERROR: (.*);?/

const isTwitterRateLimit = (url, err) => isTwitterUrl(url) && REGEX_RATE_LIMIT.test(err.message)

const proxyUri = agent => {
  const { proxy } = agent.options
  const { proxyAuth, host, port } = proxy
  return `https://${proxyAuth}@${host}:${port}`
}

const getFlags = ({ url, agent, userAgent, cacheDir }) => {
  const flags = [
    '--no-warnings',
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
    const result = REGEX_ERR_MESSAGE.exec(rawError.message)
    const [, extractedMessage] = result
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

module.exports = ({ getTunnel, onError, userAgent, cacheDir }) => {
  let retry = expirableCounter()

  return async url => {
    const tunnel = await getTunnel
    const agent = isTwitterUrl(url) && retry.val() ? await getAgent({ tunnel }) : undefined
    const flags = getFlags({ url, agent, userAgent, cacheDir })
    let data = {}

    do {
      debug(`getInfo retry=${retry.val()} url=${url} flags=${flags.join(' ')}`)
      try {
        data = await getInfo(url, flags)
      } catch (rawError) {
        const err = makeError({ rawError, url, flags })
        retry.incr()
        onError(err, url)
        if (!(tunnel && isTwitterRateLimit(url, err))) return data
      }
    } while (isEmpty(data))

    return data
  }
}

module.exports.makeError = makeError
