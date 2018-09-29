'use strict'

const memoizeToken = require('memoize-token')
const { get, chain } = require('lodash')
const split = require('binary-split')
const uaString = require('ua-string')
const { URL } = require('url')
const got = require('got')
const mem = require('mem')

const REGEX_COOKIE = /document\.cookie = decodeURIComponent\("gt=([0-9]+)/

const REGEX_TWITTER_HOST = /^https?:\/\/twitter.com/i

const REGEX_BEARER_TOKEN = /BEARER_TOKEN:"(.*?)"/

const REGEX_HREF = /href="(.*?)"/

const REGEX_AUTH_URL = /main.*.js/

const TWITTER_HOSTNAMES = ['twitter.com', 'mobile.twitter.com']

const API_GUEST_ACTIVATE_LIMIT = 180

const API_GUEST_ACTIVATE_EXPIRE = 15 * 60 * 1000 // 15 min

const isTweet = url => url.includes('/status/')

const isTwitterHost = url => TWITTER_HOSTNAMES.includes(new URL(url).hostname)

const isTwitterUrl = url => isTwitterHost(url) && isTweet(url)

const getTweetId = url => url.split('/').reverse()[0]

const getMobileUrl = mem(url =>
  url.replace(REGEX_TWITTER_HOST, 'https://mobile.twitter.com')
)

const promiseStream = async (url, { onData }) =>
  new Promise((resolve, reject) => {
    const stream = got.stream(getMobileUrl(url), {
      headers: { 'user-agent': uaString }
    })

    let req
    stream.on('request', request => (req = request))
    stream
      .pipe(split())
      .on('data', async data => {
        const result = await onData(data.toString())
        if (result) {
          req.abort()
          resolve(result)
        }
      })
      .on('error', reject)
  })

const getAuthorization = async url =>
  promiseStream(url, {
    onData: line => {
      return get(REGEX_BEARER_TOKEN.exec(line), 1)
    }
  })

const getAuthorizationFromLine = line => {
  const href = get(REGEX_HREF.exec(line), 1)
  return href && REGEX_AUTH_URL.test(href) && getAuthorization(href)
}

const guestAuthorization = async url => {
  let guestToken
  let authorization

  return promiseStream(url, {
    onData: async line => {
      const results = await Promise.resolve([
        authorization || (await getAuthorizationFromLine(line)),
        guestToken || get(REGEX_COOKIE.exec(line), 1)
      ])

      authorization = authorization || results[0]
      guestToken = guestToken || results[1]

      return guestToken && authorization
        ? { guestToken, authorization: `BEARER ${authorization}` }
        : null
    }
  })
}

const getTwitterInfo = ({ getAuth }) => async url => {
  const tweetId = getTweetId(url)
  const apiUrl = `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?tweet_mode=extended`
  const { authorization, guestToken } = await getAuth(url)

  const { body } = await got(apiUrl, {
    retry: false,
    json: true,
    headers: {
      authorization,
      'x-guest-token': guestToken
    }
  })

  return chain(body)
    .get(
      `globalObjects.tweets.${tweetId}.extended_entities.media.0.video_info.variants`
    )
    .filter('bitrate')
    .orderBy('bitrate', 'asc')
    .value()
}

module.exports = opts => {
  const getAuth = memoizeToken(guestAuthorization, {
    max: API_GUEST_ACTIVATE_LIMIT,
    expire: API_GUEST_ACTIVATE_EXPIRE,
    key: 'media:twitter',
    ...opts
  })

  return {
    getTwitterInfo: getTwitterInfo({ getAuth }),
    isTwitterUrl
  }
}
