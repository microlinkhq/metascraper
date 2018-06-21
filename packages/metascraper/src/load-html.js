'use strict'
const { forEach, flow, isEmpty, toLower } = require('lodash')
const sanitizeHtml = require('sanitize-html')
const { sanitize: sanitizeXSS } = require('dompurify')
const cheerio = require('cheerio-advanced-selectors').wrap(require('cheerio'))

const normalizeAttributes = props => (tagName, attribs) => {
  forEach(props, propName => {
    if (!isEmpty(attribs[propName])) attribs[propName] = toLower(attribs[propName])
  })
  return { tagName, attribs }
}

const clean = html =>
  sanitizeHtml(html, {
    allowedTags: false, // allow all tags
    allowedAttributes: false, // allow all attributes
    transformTags: {
      meta: normalizeAttributes(['name', 'property']),
      a: normalizeAttributes(['href']),
      link: normalizeAttributes(['rel'])
    },
    parser: {
      lowerCaseTags: true,
      decodeEntities: true,
      lowerCaseAttributeNames: true
    }
  })

const sanitize = html => sanitizeXSS(html, {
  SAFE_FOR_JQUERY: true
})

const load = html => cheerio.load(html, {
  lowerCaseTags: false,
  decodeEntities: false,
  lowerCaseAttributeNames: false
})

module.exports = flow([clean, sanitize, load])
