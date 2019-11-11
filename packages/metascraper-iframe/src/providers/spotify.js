'use strict'

const { getDomainWithoutSuffix } = require('tldts')
const spotifiURI = require('spotify-uri')

const toQuery = require('../to-query')

const spotify = ({ url, height = 380, width = 300, ...query }) => {
  const { type, id } = spotifiURI(url)
  return `<iframe src="https://open.spotify.com/embed/${type}/${id}${toQuery(
    query
  )}" width="${width}" height="${height}" frameborder="0" allowtransparency="true" allow="encrypted-media">`
}

spotify.test = url => getDomainWithoutSuffix(url) === 'spotify'

module.exports = spotify
