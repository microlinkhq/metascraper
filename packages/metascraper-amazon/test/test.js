'use strict'

const test = require('ava').default

const { test: validator } = require('..')

test('true', t => {
  t.true(validator('https://www.amazon.com/gp/product/B0057OC5O8/'))
  t.true(validator('https://amazon.com/dp/B0123456789'))
  t.true(validator('https://www.amazon.co.uk/dp/1849757097'))
  t.true(validator('https://amazon.es/dp/B01MUGXRT9'))
  t.true(validator('https://www.amazon.de/dp/B0123456789'))
  t.true(validator('https://amazon.fr/dp/B0123456789'))
  t.true(validator('https://www.amazon.it/dp/B0123456789'))
  t.true(validator('https://amzn.to/abc123'))
  t.true(validator('https://a.co/abc123'))
})

test('false', t => {
  t.false(
    validator(
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    )
  )
  t.false(validator('https://www.facebook.com/username/'))
  t.false(validator('https://twitter.com/username/'))
  t.false(validator('https://www.youtube.com/watch?v=123'))
  t.false(validator('https://example.com'))
  // Hosts that merely contain "a.co" or "amazon" as a substring must not match
  t.false(validator('https://www.rangemedia.co/some-post'))
  t.false(validator('https://formula.co/post'))
  t.false(validator('https://asitea.co/x'))
  t.false(validator('https://asitea.com/x'))
  t.false(validator('https://notamazon.com/x'))
  t.false(validator('https://amazon-fake.com/x'))
  // Subdomain spoofs where the registrable domain is the attacker's
  t.false(validator('https://amazon.evil.com/x'))
  t.false(validator('https://amzn.evil.com/x'))
  t.false(validator('https://amazon.com.evil.org/x'))
})
