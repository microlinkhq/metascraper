'use strict'

const { chain } = require('lodash')
const { URL } = require('url')
const got = require('got')

// twitter guest web token
// https://github.com/soimort/you-get/blob/da8c982608c9308765e0960e08fc28cccb74b215/src/you_get/extractors/twitter.py#L72
const TWITTER_BEARER_TOKEN = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'

const TWITTER_HOSTNAMES = ['twitter.com', 'mobile.twitter.com']

const isTwitterUrl = url => TWITTER_HOSTNAMES.includes(new URL(url).hostname)

const getTweetId = url => url.split('/').reverse()[0]

const getGuestToken = async () => {
  const { body } = await got.post('https://api.twitter.com/1.1/guest/activate.json', {
    headers: { authorization: TWITTER_BEARER_TOKEN },
    json: true
  })
  return body.guest_token
}

const getTwitterVideoInfo = async url => {
  const tweetId = getTweetId(url)
  const apiUrl = `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?tweet_mode=extended`
  const { body } = await got(apiUrl, {
    json: true,
    headers: {
      authorization: TWITTER_BEARER_TOKEN,
      'x-guest-token': await getGuestToken()
    }
  })

  return chain(body)
    .get(`globalObjects.tweets.${tweetId}.extended_entities.media.0.video_info.variants`)
    .orderBy('bitrate', 'asc')
    .value()
}

module.exports = { getTwitterVideoInfo, isTwitterUrl }
