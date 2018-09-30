'use strict'

const { find, get, chain } = require('lodash')
const memoizeToken = require('memoize-token')
const split = require('binary-split')
const uaString = require('ua-string')
const htmlUrls = require('html-urls')
const getHTML = require('html-get')
const { URL } = require('url')
const got = require('got')
const mem = require('mem')

const REGEX_COOKIE = /document\.cookie = decodeURIComponent\("gt=([0-9]+)/

const REGEX_TWITTER_HOST = /^https?:\/\/twitter.com/i

const REGEX_BEARER_TOKEN = /BEARER_TOKEN:"(.*?)"/

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

const createGetAuth = ({ getBrowserless, ...opts }) => {
  const fn = async url => {
    const mobileUrl = getMobileUrl(url)
    const { html } = await getHTML(mobileUrl, {
      prerender: true,
      getBrowserless
    })

    const guestToken = get(REGEX_COOKIE.exec(html), 1)
    const links = htmlUrls({ html, url: mobileUrl })
    const { normalizedUrl: bearerUrl } = find(links, ({ normalizedUrl }) =>
      REGEX_AUTH_URL.test(normalizedUrl)
    )
    const authorization = await getAuthorization(bearerUrl)
    return { authorization: `Bearer ${authorization}`, guestToken }
  }

  return memoizeToken(fn, {
    max: API_GUEST_ACTIVATE_LIMIT,
    expire: API_GUEST_ACTIVATE_EXPIRE,
    key: 'media:twitter',
    ...opts
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
  const getAuth = createGetAuth(opts)
  return {
    getTwitterInfo: getTwitterInfo({ getAuth }),
    isTwitterUrl
  }
}
