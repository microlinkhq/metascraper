'use strict'

const test = require('ava').default

const metascraper = require('../..')

const url = 'https://example.com'
const html = '<html></html>'

test('validate false skips to the next rule', async t => {
  let third = 0
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

test('validate applies across every property', async t => {
  const scraper = metascraper([
    {
      logo: [() => 'https://example.com/a.png'],
      image: [() => 'https://example.com/b.png']
    }
  ])

  const data = await scraper({
    url,
    html,
    validate: value => value.endsWith('b.png')
  })

  t.is(data.logo, null)
  t.is(data.image, 'https://example.com/b.png')
})

test('validate is sync friendly', async t => {
  const scraper = metascraper([
    {
      logo: [
        () => 'https://example.com/a.png',
        () => 'https://example.com/b.png'
      ]
    }
  ])

  const data = await scraper({
    url,
    html,
    validate: value => value.endsWith('b.png')
  })

  t.is(data.logo, 'https://example.com/b.png')
})

test('validate throw rejects the candidate, not the property', async t => {
  const scraper = metascraper([
    {
      logo: [
        () => 'https://example.com/a.png',
        () => 'https://example.com/b.png'
      ]
    }
  ])

  const data = await scraper({
    url,
    html,
    validate: async value => {
      if (value.endsWith('a.png')) throw new Error('validator boom')
      return true
    }
  })

  t.is(data.logo, 'https://example.com/b.png')
})

test('validate rejecting every rule nulls the property', async t => {
  const scraper = metascraper([
    {
      logo: [
        () => 'https://example.com/a.png',
        () => 'https://example.com/b.png'
      ]
    }
  ])

  const data = await scraper({ url, html, validate: () => false })

  t.is(data.logo, null)
})

test('validate receives the scraping args', async t => {
  let received
  const scraper = metascraper([
    {
      pkgName: 'metascraper-test',
      logo: [() => 'https://example.com/a.png']
    }
  ])

  await scraper({
    url,
    html,
    validate: (value, args, debug) => {
      received = { value, args, debug }
      return true
    }
  })

  t.is(received.value, 'https://example.com/a.png')
  t.is(received.args.url, url)
  t.is(typeof received.debug, 'function')
})

test('no validate is byte-identical to accepting every value', async t => {
  const scraper = metascraper([{ title: [() => 'hello'] }])

  t.deepEqual(
    await scraper({ url, html, validate: async () => true }),
    await scraper({ url, html })
  )
})
