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

test('filter downloadable urls using query string', t => {
  const videoUrl = getVideo({
    formats: [
      {
        ext: 'mp4',
        format: 'mp4',
        url: 'https://example.com/video-high.mp4?download=1',
        tbr: 500,
        acodec: 'aac',
        vcodec: 'avc1'
      },
      {
        ext: 'mp4',
        format: 'mp4',
        url: 'https://example.com/video-low.mp4',
        tbr: 100,
        acodec: 'aac',
        vcodec: 'avc1'
      }
    ]
  })

  t.is(videoUrl, 'https://example.com/video-low.mp4')
})

test('support uppercase https protocol urls', t => {
  const videoUrl = getVideo({
    formats: [
      {
        ext: 'mp4',
        format: 'mp4',
        url: 'HTTPS://example.com/video.mp4',
        tbr: 100,
        acodec: 'aac',
        vcodec: 'avc1'
      }
    ]
  })

  t.is(videoUrl, 'HTTPS://example.com/video.mp4')
})
