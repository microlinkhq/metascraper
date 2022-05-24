'use strict'

const test = require('ava')

const { getAudio } = require('..')

test('mpga extension', t => {
  t.snapshot(getAudio(require('./fixtures/mpga.json')))
})
