'use strict'

const sanitizeHtml = require('sanitize-html')
const flow = require('lodash.flow')
const cheerio = require('cheerio')

const sanitize = html => sanitizeHtml(html, {
  allowedTags: false,
  allowedAttributes: false,
  transformTags: {
    meta: (tagName, attribs) => {
      if (attribs.name) attribs.name = attribs.name.toLowerCase()
      return {tagName, attribs}
    }
  }
})

const load = cheerio.load.bind(cheerio)

module.exports = flow([
  sanitize,
  load
])
