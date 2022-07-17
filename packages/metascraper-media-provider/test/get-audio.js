'use strict'

const test = require('ava')

const { getAudio } = require('..')

test('stitcher', t => {
  t.snapshot(getAudio(require('./fixtures/provider/stitcher.json')))
})

test('google', t => {
  t.snapshot(getAudio(require('./fixtures/provider/google.json')))
})

test('podcastaddict', t => {
  t.snapshot(getAudio(require('./fixtures/provider/podcastaddict.json')))
})

test('castbox', t => {
  t.snapshot(getAudio(require('./fixtures/provider/castbox.json')))
})

test('substack', t => {
  t.snapshot(getAudio(require('./fixtures/provider/substack.json')))
})

test('youtube', t => {
  t.snapshot(getAudio(require('./fixtures/provider/youtube-video-audio.json')))
})

test('vimeo', t => {
  t.snapshot(getAudio(require('./fixtures/provider/vimeo.json')))
})
