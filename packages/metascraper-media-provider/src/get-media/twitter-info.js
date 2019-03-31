'use strict'

const memoizeToken = require('memoize-token')
const { get, chain } = require('lodash')
const pReflect = require('p-reflect')
const tunnel = require('tunnel')
const { URL } = require('url')
const got = require('got')

// twitter guest web token
// https://github.com/soimort/you-get/blob/da8c982608c9308765e0960e08fc28cccb74b215/src/you_get/extractors/twitter.py#L72
// https://github.com/rg3/youtube-dl/blob/master/youtube_dl/extractor/twitter.py#L235
const TWITTER_BEARER_TOKEN =
  'Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw'

const TWITTER_HOSTNAMES = ['twitter.com', 'mobile.twitter.com']

const TOKEN_TIMEOUT = 6000

const isTweet = url => url.includes('/status/')

const isTwitterHost = url => TWITTER_HOSTNAMES.includes(new URL(url).hostname)

const isTwitterUrl = url => isTwitterHost(url) && isTweet(url)

const getTweetId = url => url.split('/').reverse()[0]

const API_GUEST_ACTIVATE_LIMIT = 180
const API_GUEST_ACTIVATE_EXPIRE = 10 * 60 * 1000 // 10 min

const { PROXY_HOST, PROXY_PORT, PROXY_USER, PROXY_PASS } = process.env

const agent = PROXY_HOST
  ? tunnel.httpsOverHttp({
    proxy: {
      host: PROXY_HOST,
      port: PROXY_PORT,
      proxyAuth: PROXY_USER && PROXY_PASS ? `${PROXY_USER}:${PROXY_PASS}` : null
    }
  })
  : null

const getGuestToken = async (url = '', opts = {}) => {
  const { body } = await got.post('https://api.twitter.com/1.1/guest/activate.json', {
    headers: { Authorization: TWITTER_BEARER_TOKEN },
    json: true,
    timeout: TOKEN_TIMEOUT / 2,
    retry: 0,
    agent,
    ...opts
  })
  return get(body, 'guest_token')
}

const getTwitterInfo = ({ getToken, ...opts }) => async url => {
  const tweetId = getTweetId(url)
  const apiUrl = `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?tweet_mode=extended`
  const guestToken = await getToken(url)
  const res = await pReflect(
    got(apiUrl, {
      agent,
      retry: 0,
      timeout: TOKEN_TIMEOUT,
      json: true,
      headers: {
        authorization: TWITTER_BEARER_TOKEN,
        'x-guest-token': guestToken
      },
      ...opts
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

const createTwitterInfo = opts => {
  const getToken = memoizeToken(getGuestToken, {
    max: API_GUEST_ACTIVATE_LIMIT,
    expire: API_GUEST_ACTIVATE_EXPIRE,
    key: 'media:twitter',
    ...opts
  })

  return getTwitterInfo({ getToken, ...opts })
}

module.exports = { createTwitterInfo, isTwitterUrl }
