'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

test('podcasts.apple.com', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/podcasts.apple.com.html')
  )
  const url =
    'https://podcasts.apple.com/es/podcast/la-mol%C3%A9cula-que-falta/id1181714154?i=1000623871376'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.audio,
    'https://cuonda.com/mixxio/la-molecula-que-falta/1663266.mp3?key=-'
  )
})

test('music.apple.com', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/music.apple.com.html')
  )
  const url =
    'https://music.apple.com/us/album/%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3%E9%A3%B2%E3%81%BF%E4%BC%9A-single/1654452985'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.audio,
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/f8/3a/b3/f83ab3a1-8a31-4c6e-e9f4-69dc5c2473df/mzaf_2333164663415952609.plus.aac.p.m4a'
  )
})

test('open.spotify.com', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/open.spotify.com.html')
  )
  const url = 'https://open.spotify.com/episode/5Q5B9gC4PnWVo0DTp4gZ3G'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.audio,
    'https://podz-content.spotifycdn.com/audio/clips/0ilvZxarEm72Tb1ioIJfx8/clip_420612_480612.mp3'
  )
})

test('ivoox.com', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/ivoox.com.html')
  )
  const url =
    'https://www.ivoox.com/molecula-falta-audios-mp3_rf_113954595_1.html'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.audio,
    'http://www.ivoox.com/listen_mn_113954595_1.mp3?internal=HTML5'
  )
})

test('podcasts.google.com', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/podcasts.google.com.html')
  )
  const url =
    'https://podcasts.google.com/feed/aHR0cHM6Ly9jdW9uZGEuY29tL2Vsb24vZmVlZA/episode/NTRjZGRjNTliYzU4ODQxNzFmYjA2ZTNiY2NmY2NjODc'

  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.audio,
    'https://cuonda.com/elon/un-cebo-con-forma-de-x/1663252.mp3?key=-'
  )
})

test('deezer.com', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/deezer.com.html')
  )
  const url = 'https://www.deezer.com/es/track/1841999507'

  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.audio,
    'https://cdns-preview-f.dzcdn.net/stream/c-fd483edcc271cabd1a307132ebda8cef-5.mp3'
  )
})

test('transistor.fm (twitter:player:stream)', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/transistor.fm.html')
  )
  const url =
    'https://saas.transistor.fm/episodes/paul-jarvis-gaining-freedom-by-building-an-indie-business'

  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.audio,
    'https://chrt.fm/track/637E/2.gum.fm/op3.dev/e/dts.podtrac.com/redirect.mp3/media.transistor.fm/e83b42d0/9e93424b.mp3?src=site'
  )
})

test('transistor.fm (twitter:player)', async t => {
  const html = (
    await readFile(resolve(__dirname, 'fixtures/providers/transistor.fm.html'))
  )
    .toString()
    .replace(
      '<meta name="twitter:player:stream" content="https://chrt.fm/track/637E/2.gum.fm/op3.dev/e/dts.podtrac.com/redirect.mp3/media.transistor.fm/e83b42d0/9e93424b.mp3?src=site">',
      ''
    )
    .replace(
      '<meta name="twitter:player:stream:content_type" content="audio/mpeg">',
      ''
    )

  const url =
    'https://saas.transistor.fm/episodes/paul-jarvis-gaining-freedom-by-building-an-indie-business'

  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.audio,
    'https://media.transistor.fm/e83b42d0/9e93424b.mp3?src=player'
  )
})
