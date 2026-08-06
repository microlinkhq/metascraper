'use strict'

const test = require('ava').default

const metascraper = require('../..')

test('validate false skips to the next rule', async t => {
  let third = 0
  const html = '<html></html>'
  const url = 'https://example.com'
  const scraper = metascraper([
    {
      logo: [
        () => 'https://example.com/bad.svg',
        () => 'https://example.com/good.png',
        () => {
          third += 1
          return 'https://example.com/never.png'
        }
      ]
    }
  ])

  const data = await scraper({
    url,
    html,
    validate: async value => value !== 'https://example.com/bad.svg'
  })

  t.is(data.logo, 'https://example.com/good.png')
  t.is(third, 0)
})

test('validate throw nulls the property', async t => {
  const scraper = metascraper([
    {
      logo: [
        () => 'https://example.com/a.png',
        () => 'https://example.com/b.png'
      ]
    }
  ])

  const data = await scraper({
    url: 'https://example.com',
    html: '<html></html>',
    validate: async () => {
      throw new Error('validator boom')
    }
  })

  t.is(data.logo, null)
})

test('no validate is byte-identical to accepting every value', async t => {
  const scraper = metascraper([
    {
      title: [() => 'hello']
    }
  ])

  const withValidate = await scraper({
    url: 'https://example.com',
    html: '<html></html>',
    validate: async () => true
  })
  const without = await scraper({
    url: 'https://example.com',
    html: '<html></html>'
  })

  t.deepEqual(withValidate, without)
})
