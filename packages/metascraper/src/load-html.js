'use strict'

const cheerio = require('cheerio')

module.exports = (html = '') => cheerio.load(html)
