'use strict'

const {readFile, readdirSync} = require('fs')
const jsonFuture = require('json-future')
const {parallel} = require('async')
const path = require('path')

const resolveFixture = (...paths) => path.resolve(__dirname, 'fixtures', ...paths)

const loadFixture = (fixtureName, cb) => parallel([
  (next) => readFile(
    resolveFixture(fixtureName, 'input.html'),
    'utf8',
    next
  ),
  (next) => jsonFuture.loadAsync(
    resolveFixture(fixtureName, 'output.json'),
    next
  )
], (err, results) => cb(err, {
  html: results[0],
  json: results[1]
}))

const resolveFixturesFolder = () => readdirSync(resolveFixture())

module.exports = {
  resolveFixture,
  resolveFixturesFolder,
  loadFixture: require('util').promisify(loadFixture)
}
