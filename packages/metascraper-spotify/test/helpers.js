'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')

const episodeUrl = 'https://open.spotify.com/episode/64TORH3xleuD1wcnFsrH1E'
const artistUrl = 'https://open.spotify.com/artist/1gR0gsQYfi6joyO1dlp76N'
const albumUrl = 'https://open.spotify.com/album/7CjakTZxwIF8oixONe6Bpb'
const trackUrl = 'https://open.spotify.com/track/4XfokvilxHAOQXfnWD9p0Q'

const allUrls = [
  albumUrl,
  artistUrl,
  'https://open.spotify.com/local/Yasunori+Mitsuda/Chrono+Trigger+OST/A+Shot+of+Crisis/161',
  'https://open.spotify.com/local/Yasunori+Mitsuda/Chrono+Trigger+OST+Disc+2/Ayla%27s+Theme/84',
  'https://open.spotify.com/search/artist%3ADaft+Punk',
  trackUrl,
  'https://open.spotify.com/playlist/6jP6EcvAwqNksccDkIe6hX',
  'https://open.spotify.com/user/hitradio%c3%b63',
  'https://open.spotify.com/user/hitradioö63',
  'https://open.spotify.com/user/syknyk/starred',
  'https://open.spotify.com/user/tootallnate',
  'https://open.spotify.com/playlist/0Lt5S4hGarhtZmtz7BNTeX',
  'https://open.spotify.com/user/tootallnate/starred',
  'https://embed.spotify.com/?uri=spotify:track:4XfokvilxHAOQXfnWD9p0Q',
  'https://open.spotify.com/embed/track/5oscsdDQ0NpjsTgpG4bI8S',
  'https://open.spotify.com/track/6YqroNoDYeQAOUMpdmim9M',
  'https://open.spotify.com/album/3tbJ3a9ucUBtqJXYGs9bQg?highlight=spotify:track:6YqroNoDYeQAOUMpdmim9M',
  'https://play.spotify.com/track/4XfokvilxHAOQXfnWD9p0Q',
  episodeUrl
]

const fixtures = {
  [albumUrl]: () => readFile(resolve(__dirname, 'fixtures/album.html')),
  [episodeUrl]: () => readFile(resolve(__dirname, 'fixtures/episode.html')),
  [artistUrl]: () => readFile(resolve(__dirname, 'fixtures/artist.html')),
  [trackUrl]: () => readFile(resolve(__dirname, 'fixtures/track.html'))
}

module.exports = {
  albumUrl,
  allUrls,
  artistUrl,
  episodeUrl,
  fixtures,
  trackUrl
}
