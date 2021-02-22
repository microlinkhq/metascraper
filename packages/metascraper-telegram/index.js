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
const { getDomain } = require('tldts')
const cssUrls = require('css-urls')

const fromIframe = asyncMemoizeOne((url, $) => loadIframe(url, $.html()))

const toAuthor = toRule(author)
const toImage = toRule(image)
const toDate = toRule(date)

const TELEGRAM_DOMAINS = ['telegram.me', 't.me']

const isValidUrl = memoizeOne(url => TELEGRAM_DOMAINS.includes(getDomain(url)))

module.exports = () => {
  const rules = {
    author: [toAuthor($ => $('meta[property="og:title"]').attr('content'))],
    logo: [toImage($ => $('meta[property="og:image"]').attr('content'))],
    image: [
      toImage(async ($, url) => {
        const iframe = await fromIframe(url, $)
        if (!iframe) return

        const el =
          iframe.document.querySelector('.link_preview_image') ||
          iframe.document.querySelector('.link_preview_right_image') ||
          iframe.document.querySelector('.tgme_widget_message_photo_wrap')

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
        const iframe = await fromIframe(url, $)
        if (!iframe) return

        const el = iframe.document.querySelector('.datetime')
        return el ? el.getAttribute('datetime') : undefined
      })
    ]
  }
  rules.test = ({ url }) => isValidUrl(url)
  return rules
}
