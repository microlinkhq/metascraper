'use strict'

const { stringify } = require('querystring')

module.exports = ({ id, height = 360, width = 480, ...query }) =>
  `<iframe src="https://www.youtube.com/embed/${id}?${stringify(
    query
  )}" width="${width}" height="${height}" frameborder="0" allowfullscreen>`
