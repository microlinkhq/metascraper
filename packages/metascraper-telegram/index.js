'use strict'

const {
  author,
  date,
  image,
  loadIframe,
  memoizeOne,
  toRule
} = require('@metascraper/helpers')

const asyncMemoizeOne = require('async-memoize-one')
const { getDomainWithoutSuffix } = require('tldts')
const cssUrls = require('css-urls')

const iframe = asyncMemoizeOne(loadIframe)

const toAuthor = toRule(author)
const toImage = toRule(image)
const toDate = toRule(date)

const TELEGRAM_DOMAINS = ['telegram', 't']

const isValidUrl = memoizeOne(url =>
  TELEGRAM_DOMAINS.includes(getDomainWithoutSuffix(url))
)

module.exports = () => {
  const rules = {
    author: [toAuthor($ => $('meta[property="og:title"]').attr('content'))],
    logo: [toImage($ => $('meta[property="og:image"]').attr('content'))],
    image: [
      toImage(async ($, url) => {
        const dom = await iframe(url, $.html())
        const el =
          dom.window.document.querySelector('.link_preview_image') ||
          dom.window.document.querySelector('.link_preview_right_image') ||
          dom.window.document.querySelector('.tgme_widget_message_photo_wrap')

        if (!el) return

        const [{ normalizedUrl: cssUrl }] = cssUrls({
          text: el.style['background-image'],
          url
        })

        return cssUrl
      })
    ],
    date: [
      toDate(async ($, url) => {
        const dom = await iframe(url, $.html())
        const el = dom.window.document.querySelector('.datetime')
        return el ? el.getAttribute('datetime') : undefined
      })
    ]
  }
  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
