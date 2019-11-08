'use strict'

const { stringify } = require('querystring')

module.exports = ({ url, id, height = 360, width = 640, ...query }) =>
  `<iframe src="https://player.vimeo.com/video/${id}?${stringify(
    query
  )}" width="${width}" height="${height}" frameborder="0" allowfullscreen>`
