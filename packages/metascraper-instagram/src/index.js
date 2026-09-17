'use strict'

const {
  $meta,
  author,
  date,
  getHtml,
  image,
  logo,
  memoizeOne,
  parseUrl,
  title,
  toRule
} = require('@metascraper/helpers')

const toImage = toRule(image)
const toLogo = toRule(logo)

const POST_PATH = /\/(?:p|reels?|tv|stories)\//

/** First `image_versions2` URL — Instagram lists the largest candidate first. */
const firstImageVersion = html => {
  const raw = html.match(
    /"image_versions2":\{"candidates":\[\{[^[]*?"url":"([^"]+)"/
  )?.[1]
  if (!raw) return
  try {
    return JSON.parse(`"${raw}"`)
  } catch {}
}

const test = memoizeOne(
  url => parseUrl(url).domainWithoutSuffix === 'instagram'
)

const getDescription = memoizeOne(
  (_, $) => $meta('og:description')($),
  memoizeOne.EqualityFirstArgument
)

module.exports = () => {
  const rules = {
    author: ({ htmlDom: $ }) => {
      const title = $meta('og:title')($)
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
    title: ({ htmlDom: $ }) => title($meta('twitter:title')($)),
    // og:image is a signed 640 crop. Posts embed a larger feed candidate.
    image: [
      toImage(($, url) => {
        if (!POST_PATH.test(new URL(url).pathname)) return
        return firstImageVersion(getHtml($))
      })
    ],
    // rel=icon claims 192x192 but the file is 32x32. The 180 apple-touch is real.
    logo: [
      toLogo($ =>
        $('link[rel="apple-touch-icon"][sizes="180x180"]').attr('href')
      )
    ]
  }

  rules.test = ({ url }) => test(url)

  rules.pkgName = 'metascraper-instagram'

  return rules
}

module.exports.test = test
