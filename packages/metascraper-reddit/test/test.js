'use strict'

const test = require('ava')

const { test: validator, previewUrl } = require('..')
const metascraperReddit = require('..')

test('true for reddit.com', t => {
  t.true(
    validator(
      'https://www.reddit.com/r/node/comments/abc123/parse_json_safely/'
    )
  )
})

test('true for redd.it', t => {
  t.true(validator('https://redd.it/abc123'))
})

test('false', t => {
  t.false(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
})

test('rules are functions', t => {
  const rules = metascraperReddit()
  t.true(rules.image.every(rule => typeof rule === 'function'))
  t.true(rules.description.every(rule => typeof rule === 'function'))
})

test('previewUrl for string', t => {
  t.is(
    previewUrl('https://preview.redd.it/nodejs.png'),
    'https://s.microlink.io/?c=1&o1=ro&url=https%3A%2F%2Fpreview.redd.it%2Fnodejs.png'
  )
})

test('previewUrl for string with query params', t => {
  const output = previewUrl(
    'https://preview.redd.it/image.jpg?width=640&format=pjpg'
  )
  const parsed = new URL(output)
  t.is(
    parsed.searchParams.get('url'),
    'https://preview.redd.it/image.jpg?width=640&format=pjpg'
  )
  t.is(parsed.searchParams.get('format'), null)
})

test('previewUrl for non-string', t => {
  t.is(previewUrl(null), undefined)
})
