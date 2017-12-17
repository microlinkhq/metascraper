'use strict'

const condenseWhitespace = require('condense-whitespace')
const toTitle = require('to-title-case')
const { flow } = require('lodash')

const sanetize = flow([condenseWhitespace, toTitle])

module.exports = () => ({
  author: [
    ({ htmlDom: $, meta, url: baseUrl }) =>
      sanetize(
        $('.soundTitle__username')
          .first()
          .text()
      )
  ],
  description: [
    ({ htmlDom: $, meta, url: baseUrl }) =>
      sanetize(
        $('.soundTitle__description')
          .first()
          .text()
      )
  ]
})
