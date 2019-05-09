'use strict'

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
  TWITTER_ACTIVATE_LIMIT
} = require('./constant')

const isTweet = url => url.includes('/status/')

const isTwitterHost = url => TWITTER_HOSTNAMES.includes(new URL(url).hostname)

const isTwitterUrl = url => isTwitterHost(url) && isTweet(url)

const getTweetId = url => url.split('/').reverse()[0]

const getGuestToken = ({ userAgent, tunnel }) => async () => {
  const { body } = await got.post('https://api.twitter.com/1.1/guest/activate.json', {
    retry: 0,
    json: true,
    agent: tunnel ? tunnel() : undefined,
    timeout: TWITTER_TOKEN_TIMEOUT / 2,
    headers: {
      authorization: TWITTER_BEARER_TOKEN,
      origin: 'https://twitter.com',
      'user-agent': userAgent
    }
  })
  return get(body, 'guest_token')
}

const getTwitterInfo = ({ userAgent, getToken }) => async url => {
  const tweetId = getTweetId(url)
  const apiUrl = `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?tweet_mode=extended`
  const guestToken = await getToken()

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
  const tunnel = !isEmpty(proxies) ? luminatiTunnel(proxies) : undefined
  const fn = getGuestToken({ userAgent, tunnel })

  const getToken = memoizeToken(fn, {
    max: TWITTER_ACTIVATE_LIMIT,
    key: 'media:twitter',
    cache
  })

  return getTwitterInfo({ getToken, userAgent })
}

module.exports = { createTwitterInfo, isTwitterUrl }
