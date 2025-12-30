'use strict'

const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
  t.true(
    validator('https://www.tiktok.com/@cazzatime/video/7584735037615082774')
  )
})

test('false', t => {
  t.false(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
})
