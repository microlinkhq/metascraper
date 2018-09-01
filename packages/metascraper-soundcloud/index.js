'use strict'

const { $filter, title } = require('@metascraper/helpers')

module.exports = () => ({
  author: [
    ({ htmlDom: $, meta, url: baseUrl }) =>
      title($filter($, $('.soundTitle__username')))
  ],
  description: [
    ({ htmlDom: $, meta, url: baseUrl }) =>
      title(
        $('.soundTitle__description')
          .first()
          .text(),
        { capitalize: false }
      )
  ]
})
