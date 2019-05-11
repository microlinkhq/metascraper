'use strict'

const debug = require('debug')('metascraper-media-provider:twitter')
const { reduce, set, get, chain } = require('lodash')
const { protocol } = require('@metascraper/helpers')

const got = require('got')
const { getAgent, getTweetId } = require('../util')

// twitter guest web token
// https://github.com/soimort/you-get/blob/da8c982608c9308765e0960e08fc28cccb74b215/src/you_get/extractors/twitter.py#L72
// https://github.com/rg3/youtube-dl/blob/master/youtube_dl/extractor/twitter.py#L235
const TWITTER_BEARER_TOKEN =
  'Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw'

const createGuestToken = ({ userAgent, getTunnel }) => {
  let retry = 0 // TODO: reset every 10min

  return async () => {
    const tunnel = await getTunnel
    let token

    do {
      const agent = retry ? await getAgent({ tunnel }) : undefined
      debug(`guestToken retry=${retry} agent=${!!agent}`)

      try {
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
        debug(`guestToken:err`, err.statusCode)
        ++retry
      }
    } while (!token)

    return token
  }
}

const createGetTwitterInfo = ({ userAgent, getGuestToken }) => {
  let guestToken = getGuestToken()

  return async url => {
    const tweetId = getTweetId(url)
    const apiUrl = `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?tweet_mode=extended`
    let data

    do {
      const token = await guestToken
      debug(`getTwitterInfo apiUrl=${apiUrl} guestToken=${token} userAgent=${userAgent}`)

      try {
        const { body } = await got(apiUrl, {
          retry: 0,
          json: true,
          headers: {
            referer: url,
            'x-guest-token': token,
            origin: 'https://twitter.com',
            authorization: TWITTER_BEARER_TOKEN,
            'user-agent': userAgent
          }
        })

        const id = get(body, `globalObjects.tweets.${tweetId}.retweeted_status_id_str`, tweetId)

        const tweetObj = get(body, `globalObjects.tweets.${id}`)

        data = {
          extractor_key: 'Twitter',
          language: get(tweetObj, 'lang'),
          formats: chain(tweetObj)
            .get('extended_entities.media.0.video_info.variants')
            .filter('bitrate')
            .orderBy('bitrate', 'asc')
            .value()
        }
      } catch (err) {
        guestToken = getGuestToken()
        debug(`getTwitterInfo rotating token`)
      }
    } while (!data)

    return data
  }
}

module.exports = ({ fromGeneric, userAgent, getTunnel }) => {
  const getGuestToken = createGuestToken({ getTunnel, userAgent })
  const getTwitterInfo = createGetTwitterInfo({ getGuestToken, userAgent })

  return async url => {
    const [videoInfo, twitterVideos] = await Promise.all([fromGeneric(url), getTwitterInfo(url)])

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
