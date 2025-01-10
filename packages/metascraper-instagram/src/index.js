'use strict'

const franc = require('franc')

const {
  author,
  date,
  iso6393,
  lang,
  memoizeOne,
  parseUrl,
  title
} = require('@metascraper/helpers')

const detectLang = input => lang(iso6393[franc(input)])

const test = memoizeOne(
  url => parseUrl(url).domainWithoutSuffix === 'instagram'
)

const getDescription = memoizeOne(
  (_, $) => $('meta[property="og:description"]').attr('content'),
  memoizeOne.EqualityFirstArgument
)

module.exports = () => {
  const rules = {
    author: ({ htmlDom: $ }) => {
      const title = $('meta[property="og:title"]').attr('content')
      const value = title.split(' on Instagram')[0]
      return author(value)
    },
    date: ({ htmlDom: $, url }) => {
      const description = getDescription(url, $)
      const dateMatch = description.match(/on ([^,]+, \d{4})/)
      if (dateMatch === null) return
      const dateString = `${dateMatch[1]} GMT`
      return date(new Date(dateString))
    },
    lang: ({ htmlDom: $, url }) => {
      const description = getDescription(url, $)
      const input = description.split(': ').pop().split(' - ').pop()
      return detectLang(input)
    },
    title: ({ htmlDom: $ }) =>
      title($('meta[name="twitter:title"]').attr('content'))
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-instagram'

  return rules
}
