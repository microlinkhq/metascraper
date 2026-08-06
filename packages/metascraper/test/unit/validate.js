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

test('a function validate runs for every property', async t => {
  const propNames = []
  const scraper = metascraper([
    { logo: [() => 'https://example.com/a.png'], title: [() => 'hello'] }
  ])

  const data = await scraper({
    url,
    html,
    validate: (value, { propName }) => {
      propNames.push(propName)
      return true
    }
  })

  t.deepEqual(propNames.sort(), ['logo', 'title'])
  t.deepEqual(data, { logo: 'https://example.com/a.png', title: 'hello' })
})

test('an object validate runs only for the listed properties', async t => {
  const propNames = []
  const scraper = metascraper([
    { logo: [() => 'https://example.com/a.png'], title: [() => 'hello'] }
  ])

  const data = await scraper({
    url,
    html,
    validate: {
      logo: (value, { propName }) => {
        propNames.push(propName)
        return false
      }
    }
  })

  t.deepEqual(propNames, ['logo'])
  t.deepEqual(data, { logo: null, title: 'hello' })
})

test('validate receives the rule and the scraping args', async t => {
  const logoRule = () => 'https://example.com/a.png'
  let context
  const scraper = metascraper([
    { pkgName: 'metascraper-test', logo: [logoRule] }
  ])

  await scraper({
    url,
    html,
    validate: (value, ctx) => {
      context = { value, ...ctx }
      return true
    }
  })

  t.is(context.value, 'https://example.com/a.png')
  t.is(context.propName, 'logo')
  t.is(context.rule, logoRule)
  t.is(context.args.url, url)
})

test('no validate is byte-identical to accepting every value', async t => {
  const scraper = metascraper([{ title: [() => 'hello'] }])

  const withValidate = await scraper({ url, html, validate: async () => true })
  const without = await scraper({ url, html })

  t.deepEqual(withValidate, without)
})

test('no validate is byte-identical to an object validate for other properties', async t => {
  const scraper = metascraper([{ title: [() => 'hello'] }])

  const withValidate = await scraper({
    url,
    html,
    validate: { logo: () => false }
  })
  const without = await scraper({ url, html })

  t.deepEqual(withValidate, without)
})
