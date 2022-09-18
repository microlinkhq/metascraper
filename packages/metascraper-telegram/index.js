'use strict'

const {
  author,
  date,
  image,
  memoizeOne,
  sanetizeUrl,
  toRule
} = require('@metascraper/helpers')

const memoize = require('@keyvhq/memoize')
const { getDomain } = require('tldts')
const pReflect = require('p-reflect')
const cssUrls = require('css-urls')
const got = require('got')

const toAuthor = toRule(author)
const toImage = toRule(image)
const toDate = toRule(date)

const TELEGRAM_DOMAINS = ['telegram.me', 't.me']

const test = memoizeOne(url => TELEGRAM_DOMAINS.includes(getDomain(url)))

const createGetIframe = gotOpts => async (url, $) => {
  const iframe = $('iframe')
  if (iframe.length === 0) return ''

  const src = iframe.attr('src')
  if (!src || !src.startsWith('http')) return ''

  const { value: response } = await pReflect(got(src, gotOpts))
  if (!response) return ''

  return response.body
}

module.exports = ({ gotOpts, keyvOpts } = {}) => {
  const getIframe = memoize(createGetIframe(gotOpts), keyvOpts, {
    key: url => sanetizeUrl(url, { removeQueryParameters: true })
  })

  const loadIframe = fn => async ($, url) => {
    const html = await getIframe(url, $)
    return html.length ? fn($.load(html), url) : undefined
  }

  const rules = {
    author: [toAuthor($ => $('meta[property="og:title"]').attr('content'))],
    logo: [toImage($ => $('meta[property="og:image"]').attr('content'))],
    image: [
      toImage(
        loadIframe(($iframe, url) => {
          const el = $iframe(
            '.link_preview_image, .link_preview_right_image, .tgme_widget_message_photo_wrap'
          )

          if (el.length === 0) return
          const [{ normalizedUrl: cssUrl }] = cssUrls({
            text: el.css('background-image'),
            url
          })

          return cssUrl
        })
      )
    ],
    date: [toDate(loadIframe($iframe => $iframe('.datetime').attr('datetime')))]
  }

  rules.test = ({ url }) => test(url)

  return rules
}

module.exports.test = test
