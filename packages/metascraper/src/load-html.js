'use strict'

const sanitizeHtml = require('sanitize-html')
const { flow, isNil } = require('lodash')
const cheerio = require('cheerio')

const normalizeAttributes = propName => (tagName, attribs) => {
  if (!isNil(attribs[propName])) {
    attribs[propName] = attribs[propName].toLowerCase()
  }
  return { tagName, attribs }
}

const sanitize = html =>
  sanitizeHtml(html, {
    allowedTags: false,
    allowedAttributes: false,
    transformTags: {
      meta: normalizeAttributes('name'),
      a: normalizeAttributes('href'),
      link: normalizeAttributes('rel')
    }
  })

const load = cheerio.load.bind(cheerio)

module.exports = flow([sanitize, load])
