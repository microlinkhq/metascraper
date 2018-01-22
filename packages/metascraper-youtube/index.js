'use strict'

const getVideoId = require('get-video-id')

const getThumbnailUrl = id => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`

module.exports = () => ({
  publisher: [
    ({url}) => getVideoId(url).service === 'youtube' && 'YouTube'
  ],
  image: [
    ({ htmlDom, url }) => {
      const {id, service} = getVideoId(url)
      return service === 'youtube' && id && getThumbnailUrl(id)
    }
  ]
})
