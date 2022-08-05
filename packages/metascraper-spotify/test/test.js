'use strict'

const test = require('ava')

const { test: validator } = require('..')

const { spotifyUrls } = require('./helpers')

test('true', t => {
  spotifyUrls.forEach(url => t.true(validator(url)))
})

test('false', t => {
  ;['https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'].forEach(
    url => t.false(validator(url))
  )
})
