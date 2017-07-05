'use strict'

const test = require('ava')

const {
  loadFixture,
  resolveFixturesFolder
} = require('./util')

const getMetaData = require('..')

const fixtures = resolveFixturesFolder()

fixtures.forEach(fixture => {
  test(fixture, async t => {
    const {html, json} = await loadFixture(fixture)
    const metadata = await getMetaData(html)
    t.deepEqual(metadata, json)
  })
})
