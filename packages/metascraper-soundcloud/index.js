'use strict'

const { titleize } = require('@metascraper/helpers')

module.exports = () => ({
  author: [
    ({ htmlDom: $, meta, url: baseUrl }) =>
      titleize(
        $('.soundTitle__username')
          .first()
          .text()
      )
  ],
  description: [
    ({ htmlDom: $, meta, url: baseUrl }) =>
      titleize(
        $('.soundTitle__description')
          .first()
          .text(),
        { capitalize: false }
      )
  ]
})
