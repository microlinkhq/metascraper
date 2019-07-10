'use strict'

const should = require('should')

const { has } = require('../../src/get-data')

describe('.has', () => {
  it('true', () => {
    should(has(true)).be.true()
    should(has('foo')).be.true()
    should(has(123)).be.true()
    should(has(['foo'])).be.true()
    should(has({ foo: 'bar' })).be.true()
  })

  it('false', () => {
    should(has(false)).be.false()
    should(has(0)).be.false()
    should(has('')).be.false()
    should(has(null)).be.false()
    should(has(undefined)).be.false()
    should(has({})).be.false()
    should(has([])).be.false()
    should(has([''])).be.false()
  })
})
