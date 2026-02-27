'use strict'

const test = require('ava')
const { mergeRules } = require('../../src/rules')

const legacyMergeRules = (
  rules,
  baseRules,
  omitPropNames = new Set(),
  pickPropNames
) => {
  const result = {}

  const shouldIncludeProp = propName => {
    if (pickPropNames && pickPropNames.size > 0) {
      return pickPropNames.has(propName)
    }
    return !omitPropNames.has(propName)
  }

  for (const [propName, ruleArray] of baseRules) {
    if (shouldIncludeProp(propName)) {
      result[propName] = [...ruleArray]
    }
  }

  if (!rules || !Array.isArray(rules)) {
    return Object.entries(result)
  }

  for (const { test, ...ruleSet } of rules) {
    for (const [propName, innerRules] of Object.entries(ruleSet)) {
      if (!shouldIncludeProp(propName)) continue

      const processedRules = Array.isArray(innerRules)
        ? [...innerRules]
        : [innerRules]
      if (test) {
        for (const rule of processedRules) {
          rule.test = test
        }
      }

      if (result[propName]) {
        result[propName] = [...processedRules, ...result[propName]]
      } else {
        result[propName] = processedRules
      }
    }
  }

  return Object.entries(result)
}

const snapshotRules = output =>
  output.map(([propName, rules]) => [
    propName,
    rules.map(rule => ({
      id: rule.id,
      hasTest: typeof rule.test === 'function'
    }))
  ])

const compareWithLegacy = ({ createInput, omit, pick }, t) => {
  const legacyInput = createInput()
  const currentInput = createInput()

  const legacyResult = legacyMergeRules(
    legacyInput.rules,
    legacyInput.baseRules,
    omit,
    pick
  )
  const currentResult = mergeRules(
    currentInput.rules,
    currentInput.baseRules,
    omit,
    pick
  )

  t.deepEqual(snapshotRules(currentResult), snapshotRules(legacyResult))
}

const createCompatibilityInput = () => {
  const baseRules = [
    ['title', [{ id: 'base-title-1' }, { id: 'base-title-2' }]],
    ['description', [{ id: 'base-description-1' }]],
    ['author', [{ id: 'base-author-1' }]]
  ]

  const rules = [
    {
      test: () => true,
      title: [{ id: 'inline-title-1' }],
      image: [{ id: 'inline-image-1' }]
    },
    {
      description: { id: 'inline-description-1' }
    },
    {
      author: [{ id: 'inline-author-1' }, { id: 'inline-author-2' }]
    }
  ]

  return { rules, baseRules }
}

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

test('does not mutate original rule objects', t => {
  // Create original rule objects that we'll check for mutation
  const originalRule1 = { fn: () => 'value1', originalProp: 'unchanged' }
  const originalRule2 = { fn: () => 'value2', originalProp: 'unchanged' }

  // Base rules with references to original rule objects
  const baseRules = [
    ['prop1', [originalRule1]],
    ['prop2', [originalRule2]]
  ]

  // Inline rules with a test property that would cause mutation
  const inlineRules = [
    {
      test: url => url.includes('example'),
      prop1: [() => 'new value'],
      prop3: [() => 'another value']
    }
  ]

  // Store original state for comparison
  const originalRule1Copy = { ...originalRule1 }
  const originalRule2Copy = { ...originalRule2 }

  // Call mergeRules - this should not mutate the original rule objects
  mergeRules(inlineRules, baseRules)

  // Verify original rule objects are not mutated
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

  // Verify original rules don't have the test property added
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
  // Create original baseRules array
  const originalBaseRules = [
    ['title', [() => 'original title']],
    ['description', [() => 'original description']]
  ]

  // Store original length and structure for comparison
  const originalLength = originalBaseRules.length
  const originalKeys = originalBaseRules.map(([key]) => key)
  const originalTitleRulesLength = originalBaseRules[0][1].length

  // Inline rules that will add new properties and merge with existing ones
  const inlineRules = [
    {
      title: [() => 'new title'], // This will merge with existing title
      author: [() => 'new author'], // This will add a new property
      test: url => url.includes('test') // This adds a test property
    }
  ]

  // Call mergeRules - this should NOT mutate originalBaseRules
  const result = mergeRules(inlineRules, originalBaseRules)

  // Verify the original baseRules array structure was not mutated
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

  // Verify the result is different from the original (proving it's a new array)
  t.not(
    result,
    originalBaseRules,
    'Result should be a different array reference'
  )

  // Verify the result contains the expected merged rules
  t.true(
    result.length >= originalLength,
    'Result should contain at least the original rules'
  )

  // Find the title rule in the result and verify it was merged
  const titleRule = result.find(([propName]) => propName === 'title')
  t.truthy(titleRule, 'Title rule should exist in result')
  t.true(
    titleRule[1].length > originalTitleRulesLength,
    'Title rule should have more rules after merging'
  )
})

test('reuse baseRules reference when no inline rules or filters', t => {
  const baseRules = [['title', [() => 'title']]]
  const result = mergeRules(undefined, baseRules)

  t.is(result, baseRules)
})

test('reuse inner rule arrays when only filtering properties', t => {
  const titleRules = [() => 'title']
  const descriptionRules = [() => 'description']
  const baseRules = [
    ['title', titleRules],
    ['description', descriptionRules]
  ]

  const result = mergeRules(undefined, baseRules, new Set(['description']))

  t.deepEqual(
    result.map(([propName]) => propName),
    ['title']
  )
  t.is(result[0][1], titleRules)
})

test('compatibility: matches legacy merge order and test propagation', t => {
  compareWithLegacy(
    {
      createInput: createCompatibilityInput
    },
    t
  )
})

test('compatibility: matches legacy behavior with omitted properties', t => {
  compareWithLegacy(
    {
      createInput: createCompatibilityInput,
      omit: new Set(['description', 'image'])
    },
    t
  )
})

test('compatibility: matches legacy behavior with picked properties', t => {
  compareWithLegacy(
    {
      createInput: createCompatibilityInput,
      pick: new Set(['title', 'image'])
    },
    t
  )
})

test('compatibility: pick has priority over omit (legacy semantics)', t => {
  compareWithLegacy(
    {
      createInput: createCompatibilityInput,
      omit: new Set(['title', 'image']),
      pick: new Set(['title', 'image'])
    },
    t
  )
})
