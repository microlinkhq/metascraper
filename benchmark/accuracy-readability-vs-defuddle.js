'use strict'

const fs = require('fs')
const path = require('path')

const metascraper = require('../packages/metascraper/src')

const INTEGRATION_DIR = path.resolve(
  __dirname,
  '../packages/metascraper/test/integration'
)

const BASE_FIELDS = [
  'author',
  'date',
  'description',
  'audio',
  'video',
  'image',
  'lang',
  'logo',
  'manifest',
  'publisher',
  'title',
  'url'
]

const ALL_FIELDS = [...BASE_FIELDS]

const isFilled = value => value !== null && value !== undefined && value !== ''

const normalizeValue = value => {
  if (value === undefined) return null
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    return JSON.parse(JSON.stringify(value))
  }
  return value
}

const valueEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b)

const formatDuration = milliseconds => {
  if (milliseconds < 1000) return `${milliseconds}ms`
  return `${(milliseconds / 1000).toFixed(2)}s`
}

const formatValue = value => {
  const normalized = normalizeValue(value)
  if (typeof normalized === 'string') {
    const truncated =
      normalized.length <= 180 ? normalized : `${normalized.slice(0, 177)}...`
    return JSON.stringify(truncated)
  }

  const serialized = JSON.stringify(normalized)
  if (serialized.length <= 180) return serialized
  return `${serialized.slice(0, 177)}...`
}

const getMetascraper = bundleName =>
  metascraper([
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-audio')(),
    require('metascraper-video')(),
    require('metascraper-image')(),
    require('metascraper-lang')(),
    require('metascraper-logo')(),
    require('metascraper-logo-favicon')(),
    require('metascraper-manifest')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')(),
    require(bundleName)()
  ])

const extractTopLevelUrl = source => {
  const match = source.match(/const\s+url\s*=\s*(['"])(.*?)\1/)
  return match ? match[2] : null
}

const extractCases = (source, integrationName) => {
  const cases = []
  const topLevelUrl = extractTopLevelUrl(source)

  const urls = []
  const urlRegex = /const\s+url\s*=\s*(['"])(.*?)\1/g
  let urlMatch
  while ((urlMatch = urlRegex.exec(source)) !== null) {
    urls.push({ index: urlMatch.index, value: urlMatch[2] })
  }

  const tests = []
  const testRegex = /test\((['"])(.*?)\1\s*,/g
  let testMatch
  while ((testMatch = testRegex.exec(source)) !== null) {
    tests.push({ index: testMatch.index, value: testMatch[2] })
  }

  const readFileRegex = /readFile\(resolve\(__dirname,\s*(['"])(.*?)\1\)\)/g
  let fileMatch
  while ((fileMatch = readFileRegex.exec(source)) !== null) {
    const inputPath = fileMatch[2]
    const readIndex = fileMatch.index

    const nearestUrl = [...urls]
      .reverse()
      .find(candidate => candidate.index < readIndex)
    const nearestTest = [...tests]
      .reverse()
      .find(candidate => candidate.index < readIndex)

    const url = nearestUrl ? nearestUrl.value : topLevelUrl
    if (!url) continue

    cases.push({
      suite: integrationName,
      testName: nearestTest ? nearestTest.value : integrationName,
      inputPath,
      url
    })
  }

  return cases
}

const discoverCases = () => {
  const dirs = fs
    .readdirSync(INTEGRATION_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()

  const cases = []

  dirs.forEach(dir => {
    const indexPath = path.resolve(INTEGRATION_DIR, dir, 'index.js')
    if (!fs.existsSync(indexPath)) return

    const source = fs.readFileSync(indexPath, 'utf8')
    const extracted = extractCases(source, dir)
    extracted.forEach(testCase => {
      const htmlPath = path.resolve(INTEGRATION_DIR, dir, testCase.inputPath)
      if (!fs.existsSync(htmlPath)) return
      cases.push({ ...testCase, htmlPath })
    })
  })

  return cases
}

const getFieldDiff = ({ readability, defuddle }) => {
  const fields = {}
  const differentFields = []

  ALL_FIELDS.forEach(field => {
    const a = normalizeValue(readability[field])
    const b = normalizeValue(defuddle[field])

    const equal = valueEquals(a, b)
    const readabilityFilled = isFilled(a)
    const defuddleFilled = isFilled(b)

    fields[field] = {
      equal,
      readability: a,
      defuddle: b,
      readabilityFilled,
      defuddleFilled
    }

    if (!equal) differentFields.push(field)
  })

  return {
    differentFields,
    fields
  }
}

const computeSummary = rows => {
  const summary = {
    totalCases: rows.length,
    casesWithDifferences: 0,
    casesEqual: 0,
    perField: {},
    completeness: {
      readability: { totalFilled: 0 },
      defuddle: { totalFilled: 0 }
    }
  }

  ALL_FIELDS.forEach(field => {
    summary.perField[field] = {
      different: 0,
      readabilityOnlyFilled: 0,
      defuddleOnlyFilled: 0,
      bothFilled: 0,
      bothEmpty: 0,
      equal: 0
    }
  })

  rows.forEach(row => {
    if (row.differentFields.length > 0) {
      summary.casesWithDifferences++
    } else {
      summary.casesEqual++
    }

    ALL_FIELDS.forEach(field => {
      const stats = summary.perField[field]
      const diff = row.fields[field]

      if (!diff.equal) stats.different++
      else stats.equal++

      if (diff.readabilityFilled && diff.defuddleFilled) stats.bothFilled++
      else if (!diff.readabilityFilled && !diff.defuddleFilled) {
        stats.bothEmpty++
      } else if (diff.readabilityFilled) stats.readabilityOnlyFilled++
      else if (diff.defuddleFilled) stats.defuddleOnlyFilled++

      if (diff.readabilityFilled) summary.completeness.readability.totalFilled++
      if (diff.defuddleFilled) summary.completeness.defuddle.totalFilled++
    })
  })

  return summary
}

const printSummary = ({ summary, rows }) => {
  const topDiffs = [...rows]
    .sort((a, b) => b.differentFields.length - a.differentFields.length)
    .slice(0, 10)

  console.log(
    'Accuracy benchmark: metascraper-readability vs metascraper-defuddle'
  )
  console.log(`Cases: ${summary.totalCases}`)
  console.log(
    `Cases with differences: ${summary.casesWithDifferences} | Equal cases: ${summary.casesEqual}`
  )
  console.log(
    `Filled values (all fields): readability=${summary.completeness.readability.totalFilled} | defuddle=${summary.completeness.defuddle.totalFilled}`
  )
  console.log('')

  console.log('Top differing cases:')
  topDiffs.forEach(row => {
    if (row.differentFields.length === 0) return
    console.log(
      `- ${row.suite}/${row.testName}: ${
        row.differentFields.length
      } fields differ (${row.differentFields.join(', ')})`
    )
  })
}

const printCaseDifferences = ({ differentFields, fields }) => {
  if (differentFields.length === 0) {
    console.log('  -> no field differences')
    return
  }

  console.log(`  -> differences in ${differentFields.length} fields`)

  differentFields.forEach(field => {
    const diff = fields[field]
    console.log(`     ${field}`)
    console.log(`       readability: ${formatValue(diff.readability)}`)
    console.log(`       defuddle: ${formatValue(diff.defuddle)}`)
  })
}

const main = async () => {
  const start = Date.now()
  const readability = getMetascraper('metascraper-readability')
  const defuddle = getMetascraper('metascraper-defuddle')
  const cases = discoverCases()
  const totalCases = cases.length

  const rows = []

  console.log(
    `Running accuracy benchmark over ${totalCases} integration cases...`
  )

  if (totalCases === 0) {
    console.log('No integration cases were discovered. Exiting early.')
    return
  }

  for (const [index, testCase] of cases.entries()) {
    const position = index + 1
    const caseStart = Date.now()
    console.log(
      `[${position}/${totalCases}] ${testCase.suite}/${testCase.testName}`
    )

    const html = fs.readFileSync(testCase.htmlPath)

    const readabilityMetadata = await readability({ html, url: testCase.url })
    const defuddleMetadata = await defuddle({ html, url: testCase.url })

    const { differentFields, fields } = getFieldDiff({
      readability: readabilityMetadata,
      defuddle: defuddleMetadata
    })

    rows.push({
      suite: testCase.suite,
      testName: testCase.testName,
      inputPath: testCase.inputPath,
      url: testCase.url,
      differentFields,
      fields
    })

    printCaseDifferences({ differentFields, fields })

    console.log(
      `  -> done in ${formatDuration(Date.now() - caseStart)} (${
        differentFields.length
      } differing fields)`
    )
  }

  const summary = computeSummary(rows)
  printSummary({ summary, rows })
  console.log(`Elapsed: ${formatDuration(Date.now() - start)}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
