'use strict'

const test = require('ava')

const { getVideo } = require('../src')

test('twitter', t => {
  t.snapshot(getVideo(require('./fixtures/provider/twitter.json')))
})
test('vimeo', t => {
  t.snapshot(getVideo(require('./fixtures/provider/vimeo.json')))
})
test('youtube', t => {
  t.snapshot(getVideo(require('./fixtures/provider/youtube.json')))
})
test('prefer a video url with audio', t => {
  t.snapshot(getVideo(require('./fixtures/provider/youtube-video-audio.json')))
})
test('avoid m3u8', t => {
  t.snapshot(getVideo(require('./fixtures/m3u8.json')))
})
