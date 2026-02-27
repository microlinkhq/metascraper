'use strict'

const test = require('ava')

const { memoizeOne } = require('..')

test('EqualityUrlAndHtmlDom returns true for same dom reference', t => {
  let htmlCalls = 0
  const htmlDom = {
    html: () => {
      htmlCalls += 1
      return '<html><body>Hello</body></html>'
    }
  }

  const isEqual = memoizeOne.EqualityUrlAndHtmlDom(
    ['https://example.com', htmlDom],
    ['https://example.com', htmlDom]
  )

  t.true(isEqual)
  t.is(htmlCalls, 0)
})

test('EqualityUrlAndHtmlDom returns false for different dom references', t => {
  let htmlCalls = 0
  const createHtmlDom = html => ({
    html: () => {
      htmlCalls += 1
      return html
    }
  })

  const isEqual = memoizeOne.EqualityUrlAndHtmlDom(
    ['https://example.com', createHtmlDom('<html><body>Hello</body></html>')],
    ['https://example.com', createHtmlDom('<html><body>Hello</body></html>')]
  )

  t.false(isEqual)
  t.is(htmlCalls, 0)
})
