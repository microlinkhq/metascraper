'use strict'

const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
  t.true(
    validator(
      'https://dribbble.com/shots/18895539-Modern-Admin-Dashboard-UI-Design-for-Flup-Furniture-App-Website'
    )
  )
})

test('false', t => {
  t.false(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
})
