'use strict'

const should = require('should')

const { expirableCounter, getTweetId } = require('../src/get-media/util')

const TEN_MIN_MS = 10 * 60 * 1000
const ONE_SECOND_MS = 1000

describe('.expirableCounter', () => {
  it('increment and access the value', () => {
    const counter = expirableCounter(0, TEN_MIN_MS)
    should(counter.val()).be.equal(0)
    should(counter.incr()).be.equal(1)
    should(counter.incr()).be.equal(2)
    should(counter.val()).be.equal(2)
  })

  it('reset after ttl', cb => {
    const counter = expirableCounter(0, ONE_SECOND_MS)
    should(counter.incr()).be.equal(1)
    should(counter.incr()).be.equal(2)
    should(counter.val()).be.equal(2)

    setTimeout(() => {
      should(counter.val()).be.equal(0)
      should(counter.incr()).be.equal(1)
      cb()
    }, ONE_SECOND_MS)
  })
})

describe('.getTweetId', () => {
  it('remove query parameters', () => {
    const tweetId = getTweetId(
      'https://twitter.com/brodieseo/status/1512193631482163206?ref_src=twsrc%5Etfw'
    )
    should(tweetId).be.equal('1512193631482163206')
  })
})
