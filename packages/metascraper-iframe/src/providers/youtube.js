'use strict'

const getYouTubeID = require('get-youtube-id')
const youtubeRegex = require('youtube-regex')
const { stringify } = require('querystring')

const youtube = ({ url, height = 360, width = 480, ...query }) =>
  `<iframe src="https://www.youtube.com/embed/${getYouTubeID(url)}?${stringify(
    query
  )}" width="${width}" height="${height}" frameborder="0" allowfullscreen>`

youtube.test = url => youtubeRegex().test(url)

module.exports = youtube
