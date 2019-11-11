'use strict'

const getYouTubeID = require('get-youtube-id')
const youtubeRegex = require('youtube-regex')

const toQuery = require('../to-query')

const youtube = ({ url, height = 315, width = 560, ...query }) =>
  `<iframe src="https://www.youtube.com/embed/${getYouTubeID(url)}${toQuery(
    query
  )}" width="${width}" height="${height}" frameborder="0" allowfullscreen>`

youtube.test = url => youtubeRegex().test(url) && getYouTubeID(url)

module.exports = youtube
