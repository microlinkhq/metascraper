'use strict'

const { getDomainWithoutSuffix } = require('tldts')
const { stringify } = require('querystring')
const spotifiURI = require('spotify-uri')

const getSpotifyID = url => spotifiURI(url).id

const spotify = ({ url, height = 380, width = 300, ...query }) =>
  `<iframe src="https://open.spotify.com/embed/track/${getSpotifyID(
    url
  )}${stringify(
    query
  )}" width="${width}" height="${height}" frameborder="0" allowtransparency="true" allow="encrypted-media">`

spotify.test = url => getDomainWithoutSuffix(url) === 'spotify'

module.exports = spotify
