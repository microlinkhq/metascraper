'use strict'

const test = require('ava')

const { getFromTitle } = require('..')

;[
  'Murcia | Wikipedia',
  'Murcia - Wikipedia',
  '| Wikipedia',
  'San Antonio Spurs guard Manu Ginobili... - San Antonio Spurs | Wikipedia',
  'San Antonio Spurs guard Manu Ginobili... | San Antonio Spurs - Wikipedia'
].forEach(input => test(input, t => t.is(getFromTitle(input), 'Wikipedia')))
