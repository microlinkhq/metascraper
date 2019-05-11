'use strict'

const debug = require('debug')('metascraper-media-provider:generic')
const youtubedl = require('@microlink/youtube-dl')
const { isEmpty } = require('lodash')
const { promisify } = require('util')

const { getAgent, isTwitterUrl } = require('../util')

const getInfo = promisify(youtubedl.getInfo)

const REGEX_RATE_LIMIT = /429: Too Many Requests/i

const getFlags = ({ userAgent, cacheDir }) => {
  const flags = [
    '--no-warnings',
    '--no-check-certificate',
    '--prefer-free-formats',
    '--youtube-skip-dash-manifest'
  ]
  if (cacheDir) flags.push(`--cache-dir=${cacheDir}`)
  if (userAgent) flags.push(`--user-agent=${userAgent}`)
  return flags
}

const proxyUri = agent => {
  const { proxy } = agent.options
  const { proxyAuth, host, port } = proxy
  return `https://${proxyAuth}@${host}:${port}`
}

module.exports = ({ getTunnel, onError, userAgent, cacheDir }) => {
  const baseFlags = getFlags({ userAgent, cacheDir })

  return async url => {
    const flags = baseFlags.concat([`--referer=${url}`])
    const tunnel = await getTunnel
    let retry = 0
    let data = {}

    do {
      try {
        const agent = retry ? await getAgent({ tunnel }) : undefined
        debug(`getInfo retry=${retry} agent=${false} url=${url} flags=${flags.join(' ')}`)
        data = await getInfo(url, agent ? flags.concat(`--proxy=${proxyUri(agent)}`) : flags)
      } catch (err) {
        ++retry
        onError(err, url)
        if (!(isTwitterUrl(url) && REGEX_RATE_LIMIT.test(err.message))) return data
      }
    } while (isEmpty(data))

    return data
  }
}
