'use strict'

const vimeoRegex = require('vimeo-regex')
const toQuery = require('../to-query')

const getVimeoID = url => vimeoRegex().exec(url)[4]

const vimeo = ({ url, height = 360, width = 640, ...query }) =>
  `<iframe src="https://player.vimeo.com/video/${getVimeoID(url)}${toQuery(
    query
  )}" width="${width}" height="${height}" frameborder="0" allowfullscreen>`

vimeo.test = url => vimeoRegex().test(url)

module.exports = vimeo
