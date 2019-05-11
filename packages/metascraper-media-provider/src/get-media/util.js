'use strict'

const debug = require('debug')('metascraper-media-provider:util')
const luminatiTunnel = require('luminati-tunnel')
const { isEmpty } = require('lodash')
const { URL } = require('url')

const TWITTER_HOSTNAMES = ['twitter.com', 'mobile.twitter.com']

const isTweet = url => url.includes('/status/')

const isTwitterHost = url => TWITTER_HOSTNAMES.includes(new URL(url).hostname)

const isTwitterUrl = url => isTwitterHost(url) && isTweet(url)

const getTweetId = url => url.split('/').reverse()[0]

const getAgent = async ({ tunnel }) => {
  if (!tunnel) return
  const agent = tunnel()
  debug(`getAgent agent=${tunnel.index()}/${tunnel.size()}`)
  return agent
}

const createTunnel = async ({ proxies }) => {
  if (isEmpty(proxies)) return
  const tunnel = luminatiTunnel(proxies)
  debug(`tunnel size=${tunnel.size()}`)
  return tunnel
}

module.exports = {
  isTweet,
  isTwitterHost,
  isTwitterUrl,
  getTweetId,
  getAgent,
  createTunnel
}
