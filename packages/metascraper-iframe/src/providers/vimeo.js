'use strict'

const { stringify } = require('querystring')
const vimeoRegex = require('vimeo-regex')

const getVimeoID = url => vimeoRegex().exec(url)[5]

const vimeo = ({ url, height = 360, width = 640, ...query }) =>
  `<iframe src="https://player.vimeo.com/video/${getVimeoID(url)}?${stringify(
    query
  )}" width="${width}" height="${height}" frameborder="0" allowfullscreen>`

vimeo.test = url => vimeoRegex().test(url)

module.exports = vimeo
