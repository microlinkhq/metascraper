'use strict'

const test = require('ava')

const { titleize } = require('..')

test('remove unnecessary space', t => {
  t.is(titleize('     hello world         '), 'hello world')
})

test('remove separators ', t => {
  t.is(
    titleize('Fastersite: A better timer for JavaScript', {
      removeSeparator: true
    }),
    'Fastersite: A better timer for JavaScript'
  )
  t.is(
    titleize('2018–19 UEFA Champions League - Wikipedia', {
      removeSeparator: true
    }),
    '2018–19 UEFA Champions League'
  )
  t.is(
    titleize('2018–19 UEFA Champions League | Wikipedia', {
      removeSeparator: true
    }),
    '2018–19 UEFA Champions League'
  )
  t.is(
    titleize('2018–19 UEFA Champions League • Wikipedia', {
      removeSeparator: true
    }),
    '2018–19 UEFA Champions League'
  )
  t.is(
    titleize('2018–19 UEFA Champions League | Wikipedia', {
      removeSeparator: true
    }),
    '2018–19 UEFA Champions League'
  )
  t.is(
    titleize('2018–19 UEFA Champions League | Wikipedia | Wikipedia', {
      removeSeparator: true
    }),
    '2018–19 UEFA Champions League'
  )
  t.is(
    titleize('2018–19: UEFA Champions League | Wikipedia | Wikipedia', {
      removeSeparator: true
    }),
    '2018–19: UEFA Champions League'
  )
  t.is(
    titleize(
      'Yo Polymer – A Whirlwind Tour Of Web Component Tooling - HTML5Rocks Updates',
      { removeSeparator: true }
    ),
    'Yo Polymer – A Whirlwind Tour Of Web Component Tooling'
  )
  t.is(
    titleize(
      'Building a Yeoman generator      | \nRhumaric, pixel distiller    ',
      { removeSeparator: true }
    ),
    'Building a Yeoman generator'
  )
  t.is(
    titleize('Wikipedia: #Edit2014', { removeSeparator: true }),
    'Wikipedia: #Edit2014'
  )
})
