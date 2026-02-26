'use strict'

const {
  author,
  date,
  memoizeOne,
  parseUrl,
  title
} = require('@metascraper/helpers')

const test = memoizeOne(
  url => parseUrl(url).domainWithoutSuffix === 'instagram'
)

const getDescription = memoizeOne(
  (_, $) => $('meta[property="og:description"]').attr('content'),
  memoizeOne.EqualityUrlAndHtmlDom
)

module.exports = () => {
  const rules = {
    author: ({ htmlDom: $ }) => {
      const title = $('meta[property="og:title"]').attr('content')
      const value = title?.split(' on Instagram')[0]
      return author(value)
    },
    date: ({ htmlDom: $, url }) => {
      const description = getDescription(url, $)
      const dateMatch = description?.match(/on ([^,]+, \d{4})/)
      if (dateMatch === null || dateMatch === undefined) return
      const dateString = `${dateMatch[1]} GMT`
      return date(new Date(dateString))
    },
    title: ({ htmlDom: $ }) =>
      title($('meta[name="twitter:title"]').attr('content'))
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-instagram'

  return rules
}

module.exports.test = test
