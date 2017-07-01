'use strict'

const forEach = require('lodash.foreach')
const jsonFuture = require('json-future')
const flow = require('lodash.flow')
const should = require('should')
const path = require('path')
const fs = require('fs')

const smartlink = require('..')

const fixturesPath = path.resolve(__dirname, 'fixtures')
const fixtures = fs.readdirSync(fixturesPath)

const resolveFixture = (...paths) => path.resolve(__dirname, 'fixtures', ...paths)

const readFile = flow([
  resolveFixture,
  (path) => fs.readFileSync(path, 'utf8')
])

const readJSON = flow([
  resolveFixture,
  jsonFuture.load
])

const createCase = fixture => (
  describe(fixture, () => {
    const html = readFile(fixture, 'input.html')
    const expected = readJSON(fixture, 'output.json')
    const output = smartlink(html)

    forEach(expected, (expectedValue, propName) => {
      it(propName, () => {
        should(output[propName]).be.equal(expectedValue)
      })
    })
  })
)

describe('smartlink-core', () => fixtures.forEach(createCase))
