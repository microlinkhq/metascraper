'use strict'

const {
  author,
  date,
  memoizeOne,
  parseUrl,
  title,
  toRule
} = require('@metascraper/helpers')

const toAuthor = toRule(author)
const toDate = toRule(date)
const toTitle = toRule(title)

const test = memoizeOne(url => parseUrl(url).domain === 'tiktok.com')

// Assumes a valid TikTok Snowflake-style video ID
const getTimestampFromId = id => {
  const timestamp = Number(BigInt(id) >> 32n)
  return new Date(timestamp * 1000).toISOString()
}

const getAuthorAndUsername = memoizeOne((url, $) => {
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const authorName = ogTitle?.split(' on TikTok')[0]
  const username = url.split('@')[1]?.split('/')[0]
  return { authorName, username }
}, memoizeOne.EqualityFirstArgument)

module.exports = () => {
  const rules = {
    author: [
      toAuthor(($, url) => {
        const { authorName } = getAuthorAndUsername(url, $)
        return authorName
      })
    ],
    title: [
      toTitle(($, url) => {
        const { authorName, username } = getAuthorAndUsername(url, $)
        return `${authorName} (@${username}) on TikTok`
      })
    ],
    date: toDate((_, url) =>
      getTimestampFromId(url.split('/video/')[1]?.split('?')[0])
    )
  }

  rules.test = ({ url }) => test(url)
  rules.pkgName = 'metascraper-tiktok'

  return rules
}

module.exports.test = test
