'use strict'

const test = require('ava')

const { getAudio } = require('..')

test('substack', t => {
  t.snapshot(getAudio(require('./fixtures/provider/substack.json')))
})

test('youtube', t => {
  t.snapshot(getAudio(require('./fixtures/provider/youtube-video-audio.json')))
})

test('vimeo', t => {
  t.snapshot(getAudio(require('./fixtures/provider/vimeo.json')))
})
