'use strict'

const { chain } = require('lodash')
const { URL } = require('url')
const got = require('got')

// twitter guest web token
// https://github.com/soimort/you-get/blob/da8c982608c9308765e0960e08fc28cccb74b215/src/you_get/extractors/twitter.py#L72
// https://github.com/rg3/youtube-dl/blob/master/youtube_dl/extractor/twitter.py#L235
const TWITTER_BEARER_TOKEN =
  'Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw'

const TWITTER_HOSTNAMES = ['twitter.com', 'mobile.twitter.com']

const isTwitterUrl = url => TWITTER_HOSTNAMES.includes(new URL(url).hostname)

const getTweetId = url => url.split('/').reverse()[0]

const getGuestToken = async url => {
  const { body } = await got.post(
    'https://api.twitter.com/1.1/guest/activate.json',
    {
      headers: { Authorization: TWITTER_BEARER_TOKEN, Referer: url },
      json: true
    }
  )
  return body.guest_token
}

const getTwitterVideoInfo = async url => {
  const tweetId = getTweetId(url)
  const apiUrl = `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?tweet_mode=extended`
  const { body } = await got(apiUrl, {
    json: true,
    headers: {
      authorization: TWITTER_BEARER_TOKEN,
      'x-guest-token': await getGuestToken(url)
    }
  })

  return chain(body)
    .get(
      `globalObjects.tweets.${tweetId}.extended_entities.media.0.video_info.variants`
    )
    .orderBy('bitrate', 'asc')
    .value()
}

module.exports = { getTwitterVideoInfo, isTwitterUrl }
