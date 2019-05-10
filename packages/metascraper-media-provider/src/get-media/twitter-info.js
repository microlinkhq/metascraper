'use strict'

const debug = require('debug')('metascraper-media-provider:get-media')
const { get, chain, isEmpty } = require('lodash')
const luminatiTunnel = require('luminati-tunnel')
const memoizeToken = require('memoize-token')
const pReflect = require('p-reflect')
const { URL } = require('url')
const got = require('got')

const {
  TWITTER_TOKEN_TIMEOUT,
  TWITTER_BEARER_TOKEN,
  TWITTER_HOSTNAMES,
  TWITTER_ACTIVATE_LIMIT,
  CACHE_KEY_MEMOIZE,
  CACHE_KEY_PROXY
} = require('./constant')

const isTweet = url => url.includes('/status/')

const isTwitterHost = url => TWITTER_HOSTNAMES.includes(new URL(url).hostname)

const isTwitterUrl = url => isTwitterHost(url) && isTweet(url)

const getTweetId = url => url.split('/').reverse()[0]

const getAgent = async ({ cache, tunnel }) => {
  if (!tunnel) return
  const agent = tunnel()
  debug(`getAgent agent=${tunnel.index()}/${tunnel.size()}`)
  await cache.set(CACHE_KEY_PROXY, tunnel.index())
  return agent
}

const createTunnel = async ({ cache, proxies }) => {
  if (isEmpty(proxies)) return
  const index = await cache.get(CACHE_KEY_PROXY)
  if (index === undefined) await cache.set(CACHE_KEY_PROXY, 0)
  const tunnel = luminatiTunnel(proxies, index)
  debug(`tunnel index=${index || 0} size=${tunnel.size()}`)
  return tunnel
}

const createGuestToken = ({ cache, userAgent, proxies }) => {
  const getTunnel = createTunnel({ cache, proxies })
  let retry = 0

  return async () => {
    const tunnel = await getTunnel
    let token

    do {
      try {
        const agent = retry ? await getAgent({ cache, tunnel }) : undefined
        debug(`guestToken iteration=${retry} agent=${!!agent}`)
        const { body } = await got.post('https://api.twitter.com/1.1/guest/activate.json', {
          json: true,
          retry: 0,
          agent,
          headers: {
            authorization: TWITTER_BEARER_TOKEN,
            origin: 'https://twitter.com',
            'user-agent': userAgent
          }
        })
        token = get(body, 'guest_token')
      } catch (err) {
        ++retry
      }
    } while (!token)

    return token
  }
}

const getTwitterInfo = ({ userAgent, getToken }) => async url => {
  const tweetId = getTweetId(url)
  const apiUrl = `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?tweet_mode=extended`
  const guestToken = await getToken()

  debug(`getTwitterInfo apiUrl=${apiUrl} guestToken=${guestToken} userAgent=${userAgent}`)

  const res = await pReflect(
    got(apiUrl, {
      retry: 0,
      json: true,
      timeout: TWITTER_TOKEN_TIMEOUT,
      headers: {
        referer: url,
        'x-guest-token': guestToken,
        origin: 'https://twitter.com',
        authorization: TWITTER_BEARER_TOKEN,
        'user-agent': userAgent
      }
    })
  )

  const body = get(res, 'value.body')

  const id = get(body, `globalObjects.tweets.${tweetId}.retweeted_status_id_str`, tweetId)

  const tweetObj = get(body, `globalObjects.tweets.${id}`)

  return {
    extractor_key: 'Twitter',
    language: get(tweetObj, 'lang'),
    formats: chain(tweetObj)
      .get('extended_entities.media.0.video_info.variants')
      .filter('bitrate')
      .orderBy('bitrate', 'asc')
      .value()
  }
}

const createTwitterInfo = ({ cache, userAgent, proxies }) => {
  const getGuestToken = createGuestToken({ proxies, cache, userAgent })

  const getToken = memoizeToken(getGuestToken, {
    max: TWITTER_ACTIVATE_LIMIT,
    key: CACHE_KEY_MEMOIZE,
    cache
  })

  return getTwitterInfo({ getToken, userAgent })
}

module.exports = { createTwitterInfo, isTwitterUrl, createGuestToken }
