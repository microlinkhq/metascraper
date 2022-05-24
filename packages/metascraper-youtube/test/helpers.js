'use strict'

const metascraperYoutube = require('metascraper-youtube')

const metascraper = require('metascraper')([
  metascraperYoutube(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-title')(),
  require('metascraper-publisher')(),
  require('metascraper-url')()
])

module.exports = { metascraper }
