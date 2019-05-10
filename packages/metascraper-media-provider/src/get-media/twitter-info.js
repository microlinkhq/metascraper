'use strict'

const debug = require('debug')('metascraper-media-provider:get-media')
const { get, chain, isEmpty } = require('lodash')
const luminatiTunnel = require('luminati-tunnel')
const { URL } = require('url')
const got = require('got')

const { TWITTER_BEARER_TOKEN, TWITTER_HOSTNAMES } = require('./constant')

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

const createGuestToken = ({ userAgent, proxies }) => {
  const getTunnel = createTunnel({ proxies })
  let retry = 0

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

const getTwitterInfo = ({ userAgent, getGuestToken }) => {
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

const createTwitterInfo = ({ userAgent, proxies }) => {
  const getGuestToken = createGuestToken({ proxies, userAgent })
  return getTwitterInfo({ getGuestToken, userAgent })
}

module.exports = { createTwitterInfo, isTwitterUrl, createGuestToken }
