'use strict'

const cheerio = require('cheerio-advanced-selectors').wrap(require('cheerio'))

module.exports = (html = '') => cheerio.load(html)
