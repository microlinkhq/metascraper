'use strict'

const test = require('ava')

const { getVideo } = require('../src')

test('twitter', t => {
  t.snapshot(getVideo(require('./fixtures/provider/twitter.json')))
})

test('vimeo', t => {
  t.snapshot(getVideo(require('./fixtures/provider/vimeo.json')))
})

test('vimeo (stream)', t => {
  t.snapshot(getVideo(require('./fixtures/provider/vimeo-m3u8.json')))
})

test('youtube', t => {
  t.snapshot(getVideo(require('./fixtures/provider/youtube.json')))
})

test('prefer a video url with audio', t => {
  t.snapshot(getVideo(require('./fixtures/provider/youtube-video-audio.json')))
})

test('youtube (stream)', t => {
  const fixture = require('./fixtures/provider/youtube.json')
  fixture.formats = fixture.formats.filter(
    ({ resolution }) => !resolution.includes('x')
  )
  t.snapshot(getVideo(fixture))
})

test('scan formats once when selecting stream fallback', t => {
  const formats = [
    {
      ext: 'mp4',
      format: 'mp4',
      url: 'https://example.com/video-1.mp4',
      manifest_url: 'https://example.com/video-1.m3u8',
      tbr: 100,
      acodec: 'none',
      vcodec: 'none'
    },
    {
      ext: 'mp4',
      format: 'mp4',
      url: 'https://example.com/video-2.mp4',
      manifest_url: 'https://example.com/video-2.m3u8',
      tbr: 200,
      acodec: 'none',
      vcodec: 'none'
    }
  ]

  let iterationCount = 0
  const iterableFormats = {
    [Symbol.iterator]: function * () {
      for (const format of formats) {
        iterationCount += 1
        yield format
      }
    }
  }

  const videoUrl = getVideo({ formats: iterableFormats })
  t.is(videoUrl, 'https://example.com/video-2.m3u8')
  t.is(iterationCount, formats.length)
})
