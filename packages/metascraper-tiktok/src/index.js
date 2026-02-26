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
  const authorName = ogTitle
    ?.split(' on TikTok')[0]
    ?.split(' (@')[0]
    ?.split(' | TikTok')[0]
    ?.trim()
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
        return authorName && username
          ? `${authorName} (@${username}) on TikTok`
          : authorName
      })
    ],
    date: [
      toDate((_, url) => {
        const id = url.split('/video/')[1]?.split('?')[0]
        if (!id || !/^\d+$/.test(id)) return
        return getTimestampFromId(id)
      }),
      toDate($ => {
        const content = $(
          'script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]'
        ).text()
        if (!content) return
        try {
          const json = JSON.parse(content)
          const createTime =
            json.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo?.user
              ?.createTime
          return createTime
            ? new Date(createTime * 1000).toISOString()
            : undefined
        } catch (_) {}
      })
    ]
  }

  rules.test = ({ url }) => test(url)
  rules.pkgName = 'metascraper-tiktok'

  return rules
}

module.exports.test = test
