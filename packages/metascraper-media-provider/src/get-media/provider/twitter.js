'use strict'

const debug = require('debug-logfmt')(
  'metascraper-media-provider:provider:twitter'
)
const { constant, reduce, set, get, chain } = require('lodash')
const { protocol } = require('@metascraper/helpers')
const pReflect = require('p-reflect')
const pRetry = require('p-retry')
const got = require('got')

const { expirableCounter, getAgent, getTweetId } = require('../util')

// twitter guest web token
// https://github.com/soimort/you-get/blob/da8c982608c9308765e0960e08fc28cccb74b215/src/you_get/extractors/twitter.py#L72
// https://github.com/rg3/youtube-dl/blob/master/youtube_dl/extractor/twitter.py#L235
const TWITTER_BEARER_TOKEN =
  'Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw'

const TWITTER_API_URL = 'https://api.twitter.com/1.1/guest/activate.json'

const canRetry = proxy => !!proxy

const createGuestToken = ({
  timeout,
  getProxy = constant(false),
  userAgent
}) => {
  const retry = expirableCounter()

  return async () => {
    let proxy = getProxy({ url: TWITTER_API_URL, retryCount: retry.val() })
    let token

    do {
      const agent = getAgent(proxy)
      debug(`guestToken retry=${retry.val()} hasAgent=${!!agent}`)

      try {
        const { body } = await got.post(TWITTER_API_URL, {
          timeout,
          https: {
            rejectUnauthorized: false
          },
          responseType: 'json',
          agent,
          headers: {
            authorization: TWITTER_BEARER_TOKEN,
            origin: 'https://twitter.com',
            'user-agent': userAgent
          }
        })
        token = get(body, 'guest_token')
      } catch (err) {
        debug('guestToken:err', err.message)
        retry.incr()
        proxy = getProxy({ url: TWITTER_API_URL, retryCount: retry.val() })
      }
    } while (!token && canRetry(proxy))

    return token
  }
}

const createGetTwitterVideo = ({ userAgent, getGuestToken }) => {
  const getData = async (apiUrl, url, token) => {
    const { isFulfilled, value, reason } = await pReflect(
      got(apiUrl, {
        responseType: 'json',
        headers: {
          referer: url,
          'x-guest-token': token,
          origin: 'https://twitter.com',
          authorization: TWITTER_BEARER_TOKEN,
          'user-agent': userAgent
        }
      })
    )

    if (isFulfilled) return value.body
    if (reason.response.statusCode === 404) return {}
    throw reason
  }

  return async url => {
    const tweetId = getTweetId(url)
    const apiUrl = `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?tweet_mode=extended`
    let data

    const getContent = async () => {
      const token = await getGuestToken()
      debug(
        `getTwitterInfo apiUrl=${apiUrl} guestToken=${token} userAgent=${userAgent}`
      )

      const payload = await getData(apiUrl, url, token)

      const id = get(
        payload,
        `globalObjects.tweets.${tweetId}.retweeted_status_id_str`,
        tweetId
      )

      const tweetObj = get(payload, `globalObjects.tweets.${id}`)

      data = {
        extractor_key: 'Twitter',
        language: get(tweetObj, 'lang'),
        formats: chain(tweetObj)
          .get('extended_entities.media.0.video_info.variants')
          .filter('bitrate')
          .orderBy('bitrate', 'asc')
          .value()
      }
    }

    await pRetry(getContent, {
      retries: 3,
      onFailedAttempt: () => {
        debug('getTwitterInfo rotating token')
      }
    })

    return data
  }
}

module.exports = ({ fromGeneric, userAgent, getProxy }) => {
  const getGuestToken = createGuestToken({ getProxy, userAgent })
  const getTwitterVideo = createGetTwitterVideo({ getGuestToken, userAgent })

  return async url => {
    const [videoInfo, twitterVideos] = await Promise.all([
      fromGeneric(url),
      getTwitterVideo(url)
    ])

    const { formats: twitterVideoFormats, ...twitterVideosData } = twitterVideos

    const formats = reduce(
      twitterVideoFormats,
      (acc, twitterVideo, index) => {
        const { url } = twitterVideo
        const format = get(acc, index, {})
        set(acc, index, { ...format, url, protocol: protocol(url) })
        return acc
      },
      get(videoInfo, 'formats')
    )

    return { ...videoInfo, ...twitterVideosData, formats }
  }
}

module.exports.createGuestToken = createGuestToken
module.exports.createGetTwitterVideo = createGetTwitterVideo
