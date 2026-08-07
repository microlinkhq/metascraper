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
        Object.assign(() => 'https://example.com/bad.svg', {
          validate: async value => value !== 'https://example.com/bad.svg'
        }),
        Object.assign(() => 'https://example.com/good.png', {
          validate: async value => value !== 'https://example.com/bad.svg'
        }),
        Object.assign(
          () => {
            third += 1
            return 'https://example.com/never.png'
          },
          {
            validate: async value => value !== 'https://example.com/bad.svg'
          }
        )
      ]
    }
  ])

  const data = await scraper({ url, html })

  t.is(data.logo, 'https://example.com/good.png')
  t.is(third, 0)
})

test('bundle validate is copied onto every rule', async t => {
  const scraper = metascraper([
    {
      validate: value => value.endsWith('b.png'),
      logo: [
        () => 'https://example.com/a.png',
        () => 'https://example.com/b.png'
      ]
    }
  ])

  const data = await scraper({ url, html })

  t.is(data.logo, 'https://example.com/b.png')
})

test('validate is sync friendly', async t => {
  const scraper = metascraper([
    {
      logo: [
        Object.assign(() => 'https://example.com/a.png', {
          validate: value => value.endsWith('b.png')
        }),
        Object.assign(() => 'https://example.com/b.png', {
          validate: value => value.endsWith('b.png')
        })
      ]
    }
  ])

  const data = await scraper({ url, html })

  t.is(data.logo, 'https://example.com/b.png')
})

test('validate throw rejects the candidate, not the property', async t => {
  const scraper = metascraper([
    {
      logo: [
        Object.assign(() => 'https://example.com/a.png', {
          validate: async value => {
            if (value.endsWith('a.png')) throw new Error('validator boom')
            return true
          }
        }),
        Object.assign(() => 'https://example.com/b.png', {
          validate: async () => true
        })
      ]
    }
  ])

  const data = await scraper({ url, html })

  t.is(data.logo, 'https://example.com/b.png')
})

test('validate rejecting every rule nulls the property', async t => {
  const scraper = metascraper([
    {
      validate: () => false,
      logo: [
        () => 'https://example.com/a.png',
        () => 'https://example.com/b.png'
      ]
    }
  ])

  const data = await scraper({ url, html })

  t.is(data.logo, null)
})

test('bundle validate only applies to rules from that bundle', async t => {
  const scraper = metascraper([
    {
      validate: () => false,
      logo: [() => 'https://example.com/a.png']
    },
    {
      title: [() => 'hello']
    }
  ])

  const data = await scraper({ url, html })

  t.deepEqual(data, { logo: null, title: 'hello' })
})

test('validate receives the scraping args', async t => {
  let received
  const scraper = metascraper([
    {
      pkgName: 'metascraper-test',
      logo: [
        Object.assign(() => 'https://example.com/a.png', {
          validate: (value, args, debug) => {
            received = { value, args, debug }
            return true
          }
        })
      ]
    }
  ])

  await scraper({ url, html })

  t.is(received.value, 'https://example.com/a.png')
  t.is(received.args.url, url)
  t.is(typeof received.debug, 'function')
})

test('no validate is byte-identical to accepting every value', async t => {
  const scraper = metascraper([{ title: [() => 'hello'] }])
  const withValidate = metascraper([
    { validate: async () => true, title: [() => 'hello'] }
  ])

  t.deepEqual(await withValidate({ url, html }), await scraper({ url, html }))
})
