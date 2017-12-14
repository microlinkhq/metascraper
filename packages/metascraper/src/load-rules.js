'use strict'

const config = require('cosmiconfig')('metascraper').load(process.cwd())

module.exports = () =>
  Promise.resolve(config).then(
    configFile =>
      configFile || [
        require('metascraper-author'),
        require('metascraper-date'),
        require('metascraper-description'),
        require('metascraper-image'),
        require('metascraper-logo'),
        require('metascraper-publisher'),
        require('metascraper-title'),
        require('metascraper-url')
      ]
  )
