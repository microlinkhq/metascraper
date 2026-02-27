'use strict'

const test = require('ava')
const { mergeRules } = require('../../src/rules')

const getRuleIdsByProp = merged =>
  Object.fromEntries(
    merged.map(([propName, rules]) => [propName, rules.map(rule => rule.id)])
  )

const findRules = (merged, propName) =>
  merged.find(([name]) => name === propName)?.[1] ?? []

test("add a new rule from a prop that doesn't exist", async t => {
  const url = 'https://microlink.io'

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
    <div class="logos">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
      <img class="logo" href="https://microlink.io/logo.png">
    </div>

    <img class="main-logo" href="https://microlink.io/logo.png">
    <p>Hello World </p>
  </body>
  </html>
  `

  const rules = [
    {
      foo: [() => 'bar']
    }
  ]

  const metascraper = require('../..')([])
  const metadata = await metascraper({ url, html, rules })

  t.is(metadata.foo, 'bar')
})

test('add a new rule for a prop that exists', async t => {
  const url = 'https://microlink.io'

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:image" content="http://ia.media-imdb.com/images/rock.jpg" />
    <title>Document</title>
  </head>
  <body>
    <img id="logo" src="https://microlink.io/logo.png">
    <p>Hello World </p>
  </body>
  </html>
  `

  const rules = [
    {
      image: [({ htmlDom: $ }) => $('#logo').attr('src')]
    }
  ]

  const metascraper = require('../..')([require('metascraper-image')()])

  const metadata = await metascraper({ url, html, rules })
  t.is(metadata.image, 'https://microlink.io/logo.png')
})

test('merge inline rules before base rules preserving rule-set order', t => {
  const baseRules = [
    ['title', [{ id: 'base-title-1' }, { id: 'base-title-2' }]],
    ['description', [{ id: 'base-description-1' }]]
  ]

  const inlineRules = [
    {
      title: [{ id: 'inline-title-1' }, { id: 'inline-title-2' }]
    },
    {
      title: [{ id: 'inline-title-3' }],
      description: [{ id: 'inline-description-1' }]
    }
  ]

  const merged = mergeRules(inlineRules, baseRules)
  const ruleIdsByProp = getRuleIdsByProp(merged)

  t.deepEqual(ruleIdsByProp.title, [
    'inline-title-3',
    'inline-title-1',
    'inline-title-2',
    'base-title-1',
    'base-title-2'
  ])
  t.deepEqual(ruleIdsByProp.description, [
    'inline-description-1',
    'base-description-1'
  ])
})

test('accept non-array inline rule values', t => {
  const baseRules = [['title', [{ id: 'base-title-1' }]]]
  const inlineRules = [{ title: { id: 'inline-title-1' } }]

  const merged = mergeRules(inlineRules, baseRules)

  t.deepEqual(getRuleIdsByProp(merged).title, [
    'inline-title-1',
    'base-title-1'
  ])
})

test('propagate inline test function only to inline rules', t => {
  const baseRule = { id: 'base-title-1' }
  const inlineOne = { id: 'inline-title-1' }
  const inlineTwo = { id: 'inline-title-2' }
  const inlineDescription = { id: 'inline-description-1' }
  const testFn = () => true

  const baseRules = [
    ['title', [baseRule]],
    ['description', []]
  ]

  const inlineRules = [
    {
      test: testFn,
      title: [inlineOne, inlineTwo],
      description: inlineDescription
    }
  ]

  const merged = mergeRules(inlineRules, baseRules)
  const titleRules = findRules(merged, 'title')
  const descriptionRules = findRules(merged, 'description')

  t.is(titleRules[0].test, testFn)
  t.is(titleRules[1].test, testFn)
  t.is(descriptionRules[0].test, testFn)
  t.is(baseRule.test, undefined)
})

test('does not mutate original rule objects', t => {
  const originalRule1 = { fn: () => 'value1', originalProp: 'unchanged' }
  const originalRule2 = { fn: () => 'value2', originalProp: 'unchanged' }

  const baseRules = [
    ['prop1', [originalRule1]],
    ['prop2', [originalRule2]]
  ]

  const inlineRules = [
    {
      test: url => url.includes('example'),
      prop1: [() => 'new value'],
      prop3: [() => 'another value']
    }
  ]

  const originalRule1Copy = { ...originalRule1 }
  const originalRule2Copy = { ...originalRule2 }

  mergeRules(inlineRules, baseRules)

  t.deepEqual(
    originalRule1,
    originalRule1Copy,
    'originalRule1 should not be mutated'
  )
  t.deepEqual(
    originalRule2,
    originalRule2Copy,
    'originalRule2 should not be mutated'
  )
  t.is(
    originalRule1.test,
    undefined,
    'originalRule1 should not have test property'
  )
  t.is(
    originalRule2.test,
    undefined,
    'originalRule2 should not have test property'
  )
})

test('baseRules array should not be mutated (fails without cloneDeep)', t => {
  const originalBaseRules = [
    ['title', [() => 'original title']],
    ['description', [() => 'original description']]
  ]

  const originalLength = originalBaseRules.length
  const originalKeys = originalBaseRules.map(([key]) => key)
  const originalTitleRulesLength = originalBaseRules[0][1].length

  const inlineRules = [
    {
      title: [() => 'new title'],
      author: [() => 'new author'],
      test: url => url.includes('test')
    }
  ]

  const result = mergeRules(inlineRules, originalBaseRules)

  t.is(
    originalBaseRules.length,
    originalLength,
    'Original baseRules length should not change'
  )
  t.deepEqual(
    originalBaseRules.map(([key]) => key),
    originalKeys,
    'Original baseRules keys should not change'
  )
  t.is(
    originalBaseRules[0][1].length,
    originalTitleRulesLength,
    'Original title rules array should not be modified'
  )

  t.not(
    result,
    originalBaseRules,
    'Result should be a different array reference'
  )

  t.true(
    result.length >= originalLength,
    'Result should contain at least the original rules'
  )

  const titleRule = result.find(([propName]) => propName === 'title')
  t.truthy(titleRule, 'Title rule should exist in result')
  t.true(
    titleRule[1].length > originalTitleRulesLength,
    'Title rule should have more rules after merging'
  )
})

test('omit filters both base and inline rules', t => {
  const baseRules = [
    ['title', [{ id: 'base-title-1' }]],
    ['description', [{ id: 'base-description-1' }]]
  ]

  const inlineRules = [
    {
      title: [{ id: 'inline-title-1' }],
      description: [{ id: 'inline-description-1' }],
      image: [{ id: 'inline-image-1' }]
    }
  ]

  const merged = mergeRules(
    inlineRules,
    baseRules,
    new Set(['description', 'image'])
  )

  t.deepEqual(Object.keys(getRuleIdsByProp(merged)), ['title'])
  t.deepEqual(getRuleIdsByProp(merged).title, [
    'inline-title-1',
    'base-title-1'
  ])
})

test('pick filters both base and inline rules', t => {
  const baseRules = [
    ['title', [{ id: 'base-title-1' }]],
    ['description', [{ id: 'base-description-1' }]]
  ]

  const inlineRules = [
    {
      title: [{ id: 'inline-title-1' }],
      description: [{ id: 'inline-description-1' }],
      image: [{ id: 'inline-image-1' }]
    }
  ]

  const merged = mergeRules(
    inlineRules,
    baseRules,
    new Set(),
    new Set(['title', 'image'])
  )

  const ruleIdsByProp = getRuleIdsByProp(merged)
  t.deepEqual(Object.keys(ruleIdsByProp), ['title', 'image'])
  t.deepEqual(ruleIdsByProp.title, ['inline-title-1', 'base-title-1'])
  t.deepEqual(ruleIdsByProp.image, ['inline-image-1'])
})

test('pick has priority over omit', t => {
  const baseRules = [
    ['title', [{ id: 'base-title-1' }]],
    ['description', [{ id: 'base-description-1' }]]
  ]

  const inlineRules = [
    {
      title: [{ id: 'inline-title-1' }],
      image: [{ id: 'inline-image-1' }]
    }
  ]

  const merged = mergeRules(
    inlineRules,
    baseRules,
    new Set(['title', 'image']),
    new Set(['title', 'image'])
  )

  const ruleIdsByProp = getRuleIdsByProp(merged)
  t.deepEqual(Object.keys(ruleIdsByProp), ['title', 'image'])
  t.deepEqual(ruleIdsByProp.title, ['inline-title-1', 'base-title-1'])
  t.deepEqual(ruleIdsByProp.image, ['inline-image-1'])
})
