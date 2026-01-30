'use strict'

const test = require('ava')

const { test: validator } = require('..')

test('true', t => {
  // Test amazon.com and various TLDs
  t.true(validator('https://www.amazon.com/gp/product/B0057OC5O8/'))
  t.true(validator('https://amazon.com/dp/B0123456789'))
  t.true(validator('https://www.amazon.co.uk/dp/1849757097'))
  t.true(validator('https://amazon.es/dp/B01MUGXRT9'))
  t.true(validator('https://www.amazon.de/dp/B0123456789'))
  t.true(validator('https://amazon.fr/dp/B0123456789'))
  t.true(validator('https://www.amazon.it/dp/B0123456789'))

  // Test amzn.to short links
  t.true(validator('https://amzn.to/abc123'))

  // Test a.co short links
  t.true(validator('https://a.co/abc123'))
})

test('false', t => {
  // Test non-Amazon domains
  t.false(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
  t.false(validator('https://www.facebook.com/username/'))
  t.false(validator('https://twitter.com/username/'))
  t.false(validator('https://www.youtube.com/watch?v=123'))
  t.false(validator('https://example.com'))

  // Test domains that contain "amazon" but don't match the pattern
  t.false(validator('https://amaz0n.com/product/dp/B0123456789')) // 0 instead of o
  t.false(validator('https://amazon')) // no TLD
  t.false(validator('https://amzn')) // no TLD
  t.false(validator('https://a.co')) // no path after domain
  t.false(validator('https://ebay.com/product')) // different domain
})
