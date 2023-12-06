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
