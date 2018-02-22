'use strict'

const {getValue, titleize} = require('@metascraper/helpers')

module.exports = () => ({
  author: [
    ({htmlDom: $, meta, url: baseUrl}) =>
      titleize(getValue($, $('.soundTitle__username')))
  ],
  description: [
    ({htmlDom: $, meta, url: baseUrl}) =>
      titleize(
        $('.soundTitle__description')
          .first()
          .text(),
        {capitalize: false}
      )
  ]
})
